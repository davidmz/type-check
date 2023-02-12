import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isObject } from "../complex/object";
import { isNumber, isString } from "../primitives";
import { isSomeOf } from "./some-of";

describe("isSomeOf", () => {
  it("should pass valid value", () => {
    const p = isSomeOf(isString(), isNumber());

    expect(p.parse("foo")).toEqual({ ok: true, value: "foo" });
    expect(p.parse(42)).toEqual({ ok: true, value: 42 });
  });

  it("should not pass invalid value", () => {
    const p = isSomeOf(isString(), isNumber());

    expect(p.parse({})).toEqual({
      ok: false,
      error: new ParseError("is not a string and is not a number"),
    });
  });

  it("should not pass invalid value", () => {
    const p = isSomeOf(isString(), isObject({ foo: isNumber() }));

    expect(p.parse({})).toEqual({
      ok: false,
      error: new ParseError("is not a string and .foo is missing"),
    });
  });
});
