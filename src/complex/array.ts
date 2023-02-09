import { Parser, pass } from "../base/parsing";
import type { Result } from "../base/result";
import { success } from "../base/result";

export function isArray<T = unknown>(): Parser<T[]>;
export function isArray<T = unknown>(len: number): Parser<T[]>;
export function isArray<T>(p: Parser<T>): Parser<T[]>;
export function isArray<T>(p?: number | Parser<T>): Parser<T[]> {
  if (!p) {
    return pass<T[]>().and((x) => Array.isArray(x), "is not an array");
  }

  if (typeof p === "number") {
    return isArray<T>().and((x) => x.length === p, "has invalid length");
  }

  return isArray<T>().and(
    new Parser<T[]>(p.altering, (r) => {
      if (!r.ok) {
        return r;
      }
      const result = [] as unknown as T[];
      const arr = r.value as T[];
      for (let i = 0; i < arr.length; i++) {
        const r1 = p.parse(arr[i]);
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
