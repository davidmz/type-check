export type Success<T> = { readonly ok: true; readonly value: T };
export type Failure = {
  readonly ok: false;
  readonly error: NonNullable<unknown>;
};

export type Result<T> = Success<T> | Failure;

export function success<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function failure<T>(error: NonNullable<unknown>): Result<T> {
  return { ok: false, error };
}
