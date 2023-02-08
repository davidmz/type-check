import { Checker, Parser } from "../base/parsing";
import type { Result } from "../base/result";
import { success } from "../base/result";

export function isArray<T = unknown>(): Parser<T[]>;
export function isArray<T = unknown>(len: number): Parser<T[]>;
export function isArray<T>(p: Parser<T>): Parser<T[]>;
export function isArray<T>(p?: number | Parser<T>): Parser<T[]> {
  if (!p) {
    return new Checker((x) => Array.isArray(x), "is not an array");
  }

  if (typeof p === "number") {
    return isArray<T>().req((x) => x.length === p, "has invalid length");
  }

  return isArray<T>().next(
    new Parser<T[], T[]>(p.altering, (r: Result<T[]>) => {
      if (!r.ok) {
        return r;
      }
      const result = [] as unknown as T[];
      for (let i = 0; i < r.value.length; i++) {
        const r1 = p.parse(r.value[i]);
        if (!r1.ok) {
          r1.error.prependPath(`[${i}]`);
          return r1;
        }
        p.altering && result.push(r1.value);
      }
      return p.altering ? success(result) : (r as Result<T[]>);
    })
  ) as Parser<T[]>;
}
