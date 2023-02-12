import type { Result } from "./result";
import { failure, success } from "./result";

export class Parser<T, I = unknown> {
  protected prev?: Parser<I>;

  constructor(
    private readonly _altering: boolean,
    private readonly process: (r: Result<I>) => Result<T>
  ) {}

  get altering(): boolean {
    return this.prev?.altering || this._altering;
  }

  parse(x: unknown): Result<T> {
    return this.process(
      (this.prev ? this.prev.parse(x) : success(x)) as Result<I>
    );
  }

  andAlter<U>(tr: (x: T) => U): Parser<U> {
    return this.and(
      new Parser<U, T>(true, (r) => {
        if (!r.ok) {
          return r;
        }

        try {
          return success(tr(r.value));
        } catch (error) {
          return failure(error);
        }
      })
    );
  }

  and<U>(another: Parser<U, T>): Parser<U>;
  and<U = T>(check: (x: T) => boolean, failMsg?: string): Parser<U>;
  and<U>(
    check: Parser<U, T> | ((x: T) => boolean),
    failMsg = "check failed"
  ): Parser<U> {
    if (check instanceof Parser) {
      check.prev = this as Parser<T>;
      return check as Parser<U>;
    }

    return this.and(
      new Parser<U, T>(false, (r) =>
        !r.ok || check(r.value as T) ? (r as Result<U>) : failure(failMsg)
      )
    );
  }

  clone<U = T>(altering = false): Parser<U> {
    return this.and(pass(altering));
  }

  fallback<R>(v: R): Parser<T | R> {
    return this.and(
      new Parser<T | R>(true, (r) =>
        r.ok ? (r as Result<T>) : success(v as R)
      )
    );
  }
}

export function pass<T = unknown>(altering = false) {
  return new Parser(altering, (r) => r as Result<T>);
}
