import { Parser, pass } from "../base/parsing";
import type { Result } from "../base/result";
import { failure, success } from "../base/result";
import type { OptKeys, WithOptionals } from "./optional";
import { isOptionalParser } from "./optional";

export type Options = {
  extraFields?: "KEEP" | "OMIT" | "DENY";
};

export function isObject<T = object>(): Parser<T>;
export function isObject<T>(
  shape: { [K in keyof T]: Parser<T[K]> },
  options?: Options
): Parser<WithOptionals<T>>;
export function isObject<T>(
  shape?: { [K in keyof T]: Parser<T[K]> },
  options?: Options
): Parser<WithOptionals<T>> | Parser<object> {
  if (!shape) {
    return pass<WithOptionals<T>>().and(
      (x) => isPlainObject(x),
      "is not a plain object"
    );
  }
  const shapeKeys = Object.keys(shape) as OptKeys<T>[];

  const { extraFields = "KEEP" }: Options = options ?? {};

  const altering =
    extraFields === "OMIT" || shapeKeys.some((k) => shape[k].altering);

  return isObject<WithOptionals<T>>().and(
    new Parser(altering, (r) => {
      if (!r.ok) {
        return r as Result<WithOptionals<T>>;
      }

      const x = r.value as WithOptionals<T>;
      const result = {} as unknown as WithOptionals<T>;

      const extraKeys = (Object.keys(x) as OptKeys<T>[]).filter(
        (k) => !shape[k]
      );

      if (extraKeys.length > 0 && extraFields === "DENY") {
        const more = extraKeys.length > 3;
        const ks = extraKeys.slice(0, 3).map((k) => `"${String(k)}"`);
        return failure(
          `has extra ${extraKeys.length > 1 ? "fields" : "field"} ${ks.join(
            ", "
          )}${more ? "..." : ""}`
        );
      }

      for (const k of shapeKeys) {
        const p = shape[k] as Parser<WithOptionals<T>[OptKeys<T>]>;
        const opt = isOptionalParser(p);
        if (opt && !(k in x)) {
          continue;
        }
        if (!opt && !(k in x)) {
          return failure("is missing", `.${String(k)}`);
        }
        const r1 = p.parse(x[k]);
        if (!r1.ok) {
          r1.error.prependPath(`.${String(k)}`);
          return r1 as Result<WithOptionals<T>>;
        }
        if (altering) {
          result[k] = r1.value;
        }
      }

      if (altering && extraFields === "KEEP") {
        for (const k of extraKeys) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          result[k] = x[k];
        }
      }

      return (altering ? success(result) : r) as Result<WithOptionals<T>>;
    })
  ) as Parser<WithOptionals<T>>;
}

function isPlainObject(v: unknown): v is object {
  return (
    v !== null &&
    typeof v === "object" &&
    (v as { __proto__: unknown }).__proto__ === Object.prototype
  );
}
