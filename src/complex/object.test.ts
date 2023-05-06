import { describe, it } from "vitest";

import { ParseError } from "../base/error";
import { isNumber, isString } from "../primitives";
import { expectFailure, expectSuccess } from "../utility/test-helpers";
import { isObject, isOptional } from "./object";

describe("Object without subtypes", () => {
  it("should not take non-object", () => {
    const r = isObject().parse(42);
    expectFailure(r, new ParseError("is not a plain object"));
  });

  it("should not take null", () => {
    const r = isObject().parse(null);
    expectFailure(r, new ParseError("is not a plain object"));
  });

  it("should not take non-plain object", () => {
    const r = isObject().parse(new Date());
    expectFailure(r, new ParseError("is not a plain object"));
  });

  it("should take empty object", () => {
    expectSuccess(isObject().parse({}), {});
  });

  it("should take object", () => {
    expectSuccess(isObject().parse({ foo: "bar" }), { foo: "bar" });
  });
});

describe("Object with subtypes", () => {
  it("should not take object with missing field", () => {
    const r = isObject({ foo: isString() }).parse({ a: "b" });
    expectFailure(r, new ParseError("is missing", ".foo"));
  });

  it("should take object with missing optional field", () => {
    const r = isObject({ foo: isOptional(isString()) }).parse({ a: "b" });
    expectSuccess(r, { a: "b" });
  });

  it("should take object with valid required field", () => {
    const r = isObject({ a: isString() }).parse({ a: "b" });
    expectSuccess(r, { a: "b" });
  });

  it("should take object with valid optional field", () => {
    const r = isObject({ a: isOptional(isString()) }).parse({ a: "b" });
    expectSuccess(r, { a: "b" });
  });

  it("should take object with optional field with default value", () => {
    const r = isObject({ a: isString().or("bar") }).parse({ b: "foo" });
    expectSuccess(r, { a: "bar", b: "foo" });
  });

  it("should not take object with deep missing field", () => {
    const r = isObject({ foo: isObject({ foo: isString() }) }).parse({
      foo: {},
    });
    expectFailure(r, new ParseError("is missing", ".foo.foo"));
  });

  describe("Object with extra fields", () => {
    it("should keep extra fields on non-altering parse", () => {
      const r = isObject({ a: isNumber() }).parse({ a: 1, b: 2 });
      expectSuccess(r, { a: 1, b: 2 });
    });

    it("should keep extra fields on altering parse", () => {
      const r = isObject({ a: isNumber().andAlter((x) => x + 1) }).parse({
        a: 1,
        b: 2,
      });
      expectSuccess(r, { a: 2, b: 2 });
    });

    it("should DENY extra fields", () => {
      const r = isObject({ a: isNumber() }, { extraFields: "DENY" }).parse({
        a: 1,
        b: 2,
      });
      expectFailure(r, new ParseError(`has extra field "b"`));
    });

    it("should OMIT extra fields", () => {
      const r = isObject({ a: isNumber() }, { extraFields: "OMIT" }).parse({
        a: 1,
        b: 2,
      });
      expectSuccess(r, { a: 1 });
    });
  });
});
