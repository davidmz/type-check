import { ParseError } from "../base/error";
import { Parser } from "../base/parsing";
import type { Result } from "../base/result";
import { failure, success } from "../base/result";
import { isUnknown } from "../primitives";

class MissingFieldError extends ParseError {}

const missingOptional = Symbol("missingOptional");
type MissingOptional = typeof missingOptional;

type Optional<T> = T | MissingOptional;
type UnOptional<T> = T extends Optional<infer U> ? U : never;

type OptionalKeys<T> = {
  [K in keyof T]: MissingOptional extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]: MissingOptional extends T[K] ? never : K;
}[keyof T];

type WithOptionalValues<T> = {
  [K in OptionalKeys<T>]?: UnOptional<T[K]>;
};

type WithRequiredValues<T> = {
  [K in RequiredKeys<T>]: T[K];
};

type Flat<T> = {
  [K in keyof T]: T[K];
};

export type WithOptionals<T> = Flat<
  WithOptionalValues<T> & WithRequiredValues<T>
>;

type OptKey<T> = keyof WithOptionals<T>;

export function isOptional<T>(p: Parser<T>): Parser<Optional<T>> {
  return p.and(
    new Parser(true, (r) => {
      if (r.ok || !(r.error instanceof MissingFieldError)) {
        return r as Result<Optional<T>>;
      }
      return success(missingOptional);
    })
  );
}

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

  const shapeKeys = Object.keys(shape) as OptKey<T>[];

  const { extraFields = "KEEP" }: Options = options ?? {};

  const altering =
    extraFields === "OMIT" || shapeKeys.some((k) => shape[k].altering);

  return isObject().and(
    new Parser<WithOptionals<T>>(altering, (r) => {
      if (!r.ok) {
        return r;
      }

      const obj = r.value as object;
      const result = {} as unknown as WithOptionals<T>;
      const objKeys = Object.keys(obj) as OptKey<T>[];

      const extraKeys = objKeys.filter((k) => !shape[k]);
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

      for (const k of shapeKeys) {
        const p = shape[k] as Parser<WithOptionals<T>[OptKey<T>]>;
        const start =
          k in obj
            ? obj[k as keyof typeof obj]
            : failure(missingOptional, new MissingFieldError("is missing"));
        const r1 = p.parse(start);
        if (!r1.ok) {
          r1.error.prependPath(`.${String(k)}`);
          return r1 as Result<WithOptionals<T>>;
        }
        if (altering && r1.value !== missingOptional) {
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

      return altering ? success(result) : (r as Result<WithOptionals<T>>);
    })
  );
}

function isPlainObject(v: unknown): v is object {
  return (
    v !== null &&
    typeof v === "object" &&
    (v as { __proto__: unknown }).__proto__ === Object.prototype
  );
}
