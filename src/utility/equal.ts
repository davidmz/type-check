import { isUnknown } from "../primitives";

export function isEqual<T>(c: T) {
  return isUnknown().and<T>((x) => x === c, "is not equal to desired value");
}
