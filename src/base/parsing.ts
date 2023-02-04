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

export abstract class Parser<T> {
  protected parent?: Parser<unknown>;
  abstract process(r: Result<unknown>): Result<T>;

  parse(x: unknown): Result<T> {
    if (this.parent) {
      const res = this.parent.parse(x);
      if (!res.ok) {
        return res;
      }
      return this.process(res);
    }
    return this.process(success(x));
  }

  req(check: (x: T) => boolean, failMsg = "check failed"): Parser<T> {
    return new Checker(check, failMsg, this);
  }

  mod<R>(tr: (x: T) => R): Parser<R> {
    return new Transformer<T, R>(tr, this);
  }
}

export class Checker<T, I = unknown> extends Parser<T> {
  constructor(
    private readonly check: (x: I) => boolean,
    private failMsg: string,
    protected override parent?: Parser<unknown>
  ) {
    super();
  }

  process(r: Result<I>): Result<T> {
    if (!r.ok || this.check(r.value)) {
      return r as Result<T>;
    }
    return failure(new TypeError(this.failMsg));
  }
}

export class Transformer<I, T> extends Parser<T> {
  constructor(
    private readonly transform: (x: I) => T,
    protected override parent?: Parser<unknown>
  ) {
    super();
  }

  process(r: Result<I>): Result<T> {
    if (!r.ok) {
      return r;
    }

    try {
      return success(this.transform(r.value));
    } catch (error) {
      return failure(error ?? new TypeError("unexpected error"));
    }
  }
}
