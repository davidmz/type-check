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
    if (this.prev) {
      const res = this.prev.parse(x);
      if (!res.ok) {
        return res;
      }
      return this.process(res);
    }
    return this.process(success(x as I)); // FIXME
  }

  req(check: (x: T) => boolean, failMsg = "check failed"): Parser<T> {
    const p = new Checker(check, failMsg);
    p.prev = this as Parser<T>;
    return p as Parser<T>;
  }

  mod<R>(tr: (x: T) => R): Parser<R> {
    const p = new Transformer(tr);
    p.prev = this as Parser<T>;
    return p as Parser<R>;
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

export class Checker<T, I = T> extends Parser<T, I> {
  constructor(
    private readonly check: (x: I) => boolean,
    private failMsg: string
  ) {
    super(false, (r) => {
      if (!r.ok || this.check(r.value)) {
        return r as Result<T>;
      }
      return failure(this.failMsg);
    });
  }
}

export class Transformer<T, I> extends Parser<T, I> {
  constructor(private readonly transform: (x: I) => T) {
    super(true, (r) => {
      if (!r.ok) {
        return r;
      }

      try {
        return success(this.transform(r.value));
      } catch (error) {
        return failure(error);
      }
    });
  }
}
