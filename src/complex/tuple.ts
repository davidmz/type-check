import { Parser } from "../base/parsing";
import { success } from "../base/result";
import { isArray } from "./array";

export function isTuple<T extends [unknown, ...unknown[]]>(
  ...parsers: { [K in keyof T]: Parser<T[K]> }
): Parser<T> {
  const altering = parsers.some((p) => p.altering);
  return isArray(parsers.length).and(
    new Parser(altering, (r) => {
      if (!r.ok) {
        return r;
      }
      const result = [] as unknown as T;
      const arr = r.value;
      for (let i = 0; i < arr.length; i++) {
        const r1 = parsers[i].parse(arr[i]);
        if (!r1.ok) {
          r1.error.prependPath(`[${i}]`);
          return r1;
        }
        altering && result.push(r1.value);
      }
      return altering ? success(result) : r;
    })
  ) as Parser<T>;
}
