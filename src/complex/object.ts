import type { Parser } from "../base/parsing";
import { Checker } from "../base/parsing";
import type { WithOptionals } from "./optional";
import { isOptionalParser } from "./optional";

export function isObject(): Parser<object>;
export function isObject<T>(shape: { [K in keyof T]: Parser<T[K]> }): Parser<
  WithOptionals<T>
>;
export function isObject<T>(shape?: { [K in keyof T]: Parser<T[K]> }):
  | Parser<WithOptionals<T>>
  | Parser<object> {
  if (!shape) {
    return new Checker<object>(
      (x) => isPlainObject(x),
      "is not a plain object"
    );
  }
  const keys = Object.keys(shape) as (keyof T)[];

  if (keys.every((k) => shape[k] instanceof Checker)) {
    return (isObject() as Parser<WithOptionals<T>>).req((x) =>
      keys.every(
        (k) =>
          (isOptionalParser(shape[k]) && !(k in x)) ||
          shape[k].parse((x as T)[k]).ok
      )
    );
  }

  return (isObject() as Parser<WithOptionals<T>>).mod((x) => {
    const result = [] as unknown as T;
    for (const k of keys) {
      if (isOptionalParser(shape[k]) && !(k in x)) {
        continue;
      }
      const r = shape[k].parse((x as T)[k]);
      if (!r.ok) {
        throw r.error;
      }
      result[k] = r.value;
    }
    return result as WithOptionals<T>;
  });
}

function isPlainObject(v: unknown): v is object {
  return (
    v !== null &&
    typeof v === "object" &&
    (v as { __proto__: unknown }).__proto__ === Object.prototype
  );
}
