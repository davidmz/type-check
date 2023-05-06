import { ParseError } from "./error";

export type Success<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Failure = {
  readonly ok: false;
  readonly value: unknown;
  readonly error: ParseError;
};

export type Result<T> = Success<T> | Failure;

class Res<T> {
  public constructor(
    public readonly value: T,
    public readonly error: ParseError | null
  ) {}

  public get ok(): boolean {
    return !this.error;
  }
}

export function isResult<T = unknown>(x: unknown): x is Result<T> {
  return x instanceof Res;
}

export function success<T>(value: T) {
  return new Res(value, null) as Result<T>;
}

export function failure<T>(value: unknown, error: unknown) {
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

  return new Res(value, parseError) as Result<T>;
}
