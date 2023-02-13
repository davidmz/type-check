import { describe, it } from "vitest";

import { ParseError } from "../base/error";
import { isObject } from "../complex/object";
import { isNumber, isString } from "../primitives";
import { isSomeOf } from "./some-of";
import { expectFailure, expectSuccess } from "./test-helpers";

describe("isSomeOf", () => {
  it("should pass valid value", () => {
    const p = isSomeOf(isString(), isNumber());

    expectSuccess(p.parse("foo"), "foo");
    expectSuccess(p.parse(42), 42);
  });

  it("should not pass invalid value", () => {
    const p = isSomeOf(isString(), isNumber());

    expectFailure(
      p.parse({}),
      new ParseError("is not a string and is not a number")
    );
  });

  it("should not pass invalid value", () => {
    const p = isSomeOf(isString(), isObject({ foo: isNumber() }));

    expectFailure(
      p.parse({}),
      new ParseError("is not a string and .foo is missing")
    );
  });
});
