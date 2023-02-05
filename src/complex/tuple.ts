import type { Parser } from "../base/parsing";
import { isArray } from "./array";

export function isTuple<T extends [unknown, ...unknown[]]>(
  ...parsers: { [K in keyof T]: Parser<T[K]> }
): Parser<T> {
  if (parsers.every((p) => !p.altering)) {
    return (isArray(parsers.length) as Parser<T>).req(
      (x) => x.every((it, i) => parsers[i].parse(it).ok),
      "is not an array of given types"
    );
  }

  return (isArray(parsers.length) as Parser<T>).mod((x) => {
    const result = [] as unknown as T;
    for (let i = 0; i < x.length; i++) {
      const r = parsers[i].parse(x[i]);
      if (!r.ok) {
        throw r.error;
      }
      result.push(r.value);
    }
    return result;
  });
}
