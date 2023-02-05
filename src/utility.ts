import type { Parser } from "./base/parsing";
import { Checker, Transformer } from "./base/parsing";

export type Parsed<T> = T extends Parser<infer V> ? V : never;

export function isOneOf<T extends [unknown, unknown, ...unknown[]]>(
  ...parsers: { [K in keyof T]: Parser<T[K]> }
): Parser<T[number]> {
  if (parsers.every((p) => !p.altering)) {
    return new Checker(
      (x) => parsers.some((p) => p.parse(x).ok),
      "is not matches any given types"
    );
  }

  return new Transformer((x) => {
    for (const p of parsers) {
      const res = p.parse(x);
      if (res.ok) {
        return res.value;
      }
    }
    throw new TypeError("is not matches any given types");
  });
}

export function isEqual<T>(c: T): Parser<T> {
  return new Checker((x) => x === c, "is not a required constant");
}

export function withFallback<T, U>(p: Parser<T>, v: U) {
  return isOneOf(p, new Transformer(() => v));
}
