import type { Parser } from "./base/parsing";
import { pass } from "./base/parsing";

export function isUnknown(): Parser<unknown> {
  return pass();
}

function typeChecker<T>(type: string, m = `is not a ${type}`) {
  return () => isUnknown().and<T>((x) => typeof x === type, m);
}

export const isString = typeChecker<string>("string");
export const isNumber = typeChecker<number>("number");
export const isBoolean = typeChecker<boolean>("boolean");

export function isNull() {
  return isUnknown().and<null>((x) => x === null, "is not a null");
}
