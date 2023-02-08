import { ParseError } from "./error";

export type Success<T> = { readonly ok: true; readonly value: T };
export type Failure = {
  readonly ok: false;
  readonly error: ParseError;
};

export type Result<T> = Success<T> | Failure;

export function success<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function failure<T>(error: unknown, prependPath = ""): Result<T> {
  let parseError: ParseError;
  if (error instanceof ParseError) {
    parseError = error;
  } else if (error instanceof Error) {
    parseError = new ParseError(error.message);
  } else if (typeof error === "string") {
    parseError = new ParseError(error);
  } else {
    parseError = new ParseError("threw unexpected error");
  }

  parseError.prependPath(prependPath);

  return { ok: false, error: parseError };
}
