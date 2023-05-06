import type { Result } from "./result";
import { failure, isResult, success } from "./result";

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
    const r0 = isResult<I>(x) ? x : success(x as I);
    return this.process(this.prev ? this.prev.parse(r0) : r0);
  }

  andAlter<U>(tr: (x: T) => U): Parser<U> {
    return this.and(
      new Parser<U, T>(true, (r) => {
        if (!r.ok) {
          return r;
        }

        try {
          return success(tr(r.value as T));
        } catch (error) {
          return failure(r.value as unknown, error);
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
      const chk = check.prev ? check.clone() : check;
      chk.prev = this as Parser<T>;
      return chk as Parser<U>;
    }

    return this.and(
      new Parser<U, T>(false, (r) => {
        if (!r.ok) {
          return r;
        }
        if (check(r.value)) {
          return success(r.value) as Result<U>;
        }
        return failure(r.value, failMsg);
      })
    );
  }

  or<U>(value: U): Parser<U | T>;
  or<U>(other: Parser<U>): Parser<U | T>;
  or<U>(other: U | Parser<U>): Parser<U | T> {
    return this.and(
      new Parser<U | T>(true, (r) => {
        if (r.ok) {
          return r as Result<T>;
        }
        if (other instanceof Parser) {
          return other.parse(r.value);
        }
        return success<U>(other);
      })
    );
  }

  clone<U = T>(altering = false): Parser<U> {
    return this.and(pass(altering));
  }
}

export function pass<T = unknown>(altering = false) {
  return new Parser(altering, (r) => r as Result<T>);
}
