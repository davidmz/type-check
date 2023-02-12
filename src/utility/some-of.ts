import { Parser } from "../base/parsing";
import { failure } from "../base/result";

export function isSomeOf<T extends [unknown, unknown, ...unknown[]]>(
  ...parsers: {
    [K in keyof T]: Parser<T[K]>;
  }
): Parser<T[number]> {
  return new Parser(false, (r) => {
    if (!r.ok) {
      return r;
    }

    const errors: Error[] = [];
    for (const parser of parsers) {
      const r1 = parser.parse(r.value);
      if (r1.ok) {
        return r1;
      }
      errors.push(r1.error);
    }

    return failure(
      errors.map((e) => e.message.replace(/^\$\s?/, "")).join(" and ")
    );
  });
}
