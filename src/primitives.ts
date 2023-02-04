import type { Parser } from "./base/parsing";
import { Checker } from "./base/parsing";

function typeChecker<T>(type: string, m = "is not a " + type): () => Parser<T> {
  return () => new Checker((x) => typeof x === type, m);
}

export const isString = typeChecker<string>("string");
export const isNumber = typeChecker<number>("number");
export const isBoolean = typeChecker<boolean>("boolean");

export function isNull(): Parser<null> {
  return new Checker((x) => x === null, "is not a null");
}

export function isUnknown(): Parser<unknown> {
  return new Checker(() => true, "/!\\ is not possible");
}
