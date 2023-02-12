import { isString, isUnknown } from "../primitives";

export function isDate() {
  return isUnknown().and<Date>((x) => x instanceof Date);
}

export function isValidDate() {
  return isDate().and((x) => isFinite(x.valueOf()));
}

export function isDateString() {
  return isString()
    .andAlter((x) => new Date(x))
    .and((x) => isFinite(x.valueOf()));
}
