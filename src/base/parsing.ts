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
    return this.process(this.prev ? this.prev.parse(x) : success(x as I));
  }

  andAlter<R>(tr: (x: T) => R): Parser<R> {
    return this.next<R>(
      new Parser(true, (r) => {
        if (!r.ok) {
          return r;
        }

        try {
          return success(tr(r.value as T));
        } catch (error) {
          return failure(error);
        }
      })
    ) as Parser<R>;
  }

  and(another: Parser<T>): Parser<T>;
  and(check: (x: T) => boolean, failMsg?: string): Parser<T>;
  and(
    check: Parser<T> | ((x: T) => boolean),
    failMsg = "check failed"
  ): Parser<T> {
    if (!(check instanceof Parser)) {
      const chk = check;
      check = new Parser<T, T>(false, (r) =>
        !r.ok || chk(r.value) ? r : failure(failMsg)
      ) as Parser<T>;
    }
    return this.next(check) as Parser<T>;
  }

  clone(): Parser<T, I> {
    return this.and(() => true);
  }

  protected next<U = T>(p: Parser<U>): Parser<U> {
    // You should clone existing parser manually!
    p.prev = this as Parser<T>;
    return p;
  }

  fallback<R>(v: R): Parser<T | R, T> {
    const p = new Parser<T | R, T>(
      true,
      (r: Result<T>): Result<T | R> => (r.ok ? r : success(v as R))
    );
    p.prev = this as Parser<T>;
    return p;
  }
}

export function pass<T = unknown>() {
  return new Parser<T, T>(false, (r) => r);
}
