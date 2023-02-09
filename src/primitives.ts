import type { Parser } from "./base/parsing";
import { pass } from "./base/parsing";

function typeChecker<T>(type: string, m = `is not a ${type}`): () => Parser<T> {
  return () => pass<T>().and((x) => typeof x === type, m);
}

export const isString = typeChecker<string>("string");
export const isNumber = typeChecker<number>("number");
export const isBoolean = typeChecker<boolean>("boolean");

export function isNull(): Parser<null> {
  return pass<null>().and((x) => x === null, "is not a null");
}

export function isUnknown(): Parser<unknown> {
  return pass().and(() => true, "/!\\ is not possible");
}
