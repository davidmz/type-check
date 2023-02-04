import type { Parser } from "../base/parsing";
import { Checker } from "../base/parsing";

export function isArray(): Parser<unknown[]>;
export function isArray(len: number): Parser<unknown[]>;
export function isArray<T>(p: Parser<T>): Parser<T[]>;
export function isArray<T>(
  p?: number | Parser<T>
): Parser<T[]> | Parser<unknown[]> {
  if (!p) {
    return new Checker((x) => Array.isArray(x), "is not an array");
  }

  if (typeof p === "number") {
    return isArray().req((x) => x.length === p, "has invalid length");
  }

  if (p instanceof Checker) {
    return isArray().req(
      (x) => x.every((it) => p.parse(it).ok),
      "is not an array of given type"
    );
  }

  return isArray().mod((x) => {
    const result: T[] = [];
    for (const it of x) {
      const r = p.parse(it);
      if (!r.ok) {
        throw r.error;
      }
      result.push(r.value);
    }
    return result;
  });
}
