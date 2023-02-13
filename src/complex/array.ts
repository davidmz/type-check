import { Parser } from "../base/parsing";
import { success } from "../base/result";
import { isUnknown } from "../primitives";

export function isArray<T = unknown>(): Parser<T[]>;
export function isArray<T = unknown>(len: number): Parser<T[]>;
export function isArray<T>(p: Parser<T>): Parser<T[]>;
export function isArray<T>(p?: number | Parser<T>): Parser<T[]> {
  if (!p) {
    return isUnknown().and((x) => Array.isArray(x), "is not an array");
  }

  if (typeof p === "number") {
    return isArray().and((x) => x.length === p, "has invalid length");
  }

  return isArray().and(
    new Parser(p.altering, (r) => {
      if (!r.ok) {
        return r;
      }
      const result = [] as unknown as T[];
      const arr = r.value;
      for (let i = 0; i < arr.length; i++) {
        const r1 = p.parse(arr[i]);
        if (!r1.ok) {
          r1.error.prependPath(`[${i}]`);
          return r1;
        }
        p.altering && result.push(r1.value);
      }
      return p.altering ? success(result) : r;
    })
  ) as Parser<T[]>;
}
