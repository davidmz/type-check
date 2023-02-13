import { Parser } from "../base/parsing";
import type { Result } from "../base/result";
import { failure, success } from "../base/result";
import { isUnknown } from "../primitives";
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
    return isUnknown().and((x) => isPlainObject(x), "is not a plain object");
  }
  const shapeKeys = Object.keys(shape) as OptKeys<T>[];

  const { extraFields = "KEEP" }: Options = options ?? {};

  const altering =
    extraFields === "OMIT" || shapeKeys.some((k) => shape[k].altering);

  return isObject().and(
    new Parser<WithOptionals<T>, WithOptionals<T>>(altering, (r) => {
      if (!r.ok) {
        return r;
      }

      const obj = r.value;
      const result = {} as unknown as WithOptionals<T>;

      const extraKeys = (Object.keys(obj) as OptKeys<T>[]).filter(
        (k) => !shape[k]
      );
      const existingKeys = shapeKeys.filter((k) => k in obj);
      const missingKeys = shapeKeys.filter((k) => !(k in obj));

      if (extraKeys.length > 0 && extraFields === "DENY") {
        const more = extraKeys.length > 3;
        const ks = extraKeys.slice(0, 3).map((k) => `"${String(k)}"`);
        return failure(
          obj,
          `has extra ${extraKeys.length > 1 ? "fields" : "field"} ${ks.join(
            ", "
          )}${more ? "..." : ""}`
        );
      }

      // Missing keys
      for (const k of missingKeys) {
        const p = shape[k] as Parser<WithOptionals<T>[OptKeys<T>]>;
        if (!isOptionalParser(p)) {
          return failure(obj, "is missing", `.${String(k)}`);
        }
      }

      // Existing keys
      for (const k of existingKeys) {
        const p = shape[k] as Parser<WithOptionals<T>[OptKeys<T>]>;
        const r1 = p.parse(obj[k]);
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
          result[k] = obj[k];
        }
      }

      return altering ? success(result) : r;
    }) as Parser<WithOptionals<T>>
  );
}

function isPlainObject(v: unknown): v is object {
  return (
    v !== null &&
    typeof v === "object" &&
    (v as { __proto__: unknown }).__proto__ === Object.prototype
  );
}
