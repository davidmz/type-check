import type { Parser } from "../base/parsing";
import { isUnknown } from "../primitives";

export function isAlways<T>(val: T): Parser<T> {
  return isUnknown().andAlter(() => val);
}
