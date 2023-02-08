import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isNumber, isString } from "../primitives";
import { isObject } from "./object";
import { isOptional } from "./optional";

describe("Object without subtypes", () => {
  it("should not take non-object", () => {
    const r = isObject().parse(42);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a plain object"),
    });
  });

  it("should not take null", () => {
    const r = isObject().parse(null);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a plain object"),
    });
  });

  it("should not take non-plain object", () => {
    const r = isObject().parse(new Date());
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a plain object"),
    });
  });

  it("should take empty object", () => {
    const r = isObject().parse({});
    expect(r).toEqual({ ok: true, value: {} });
  });

  it("should take object", () => {
    const r = isObject().parse({ foo: "bar" });
    expect(r).toEqual({ ok: true, value: { foo: "bar" } });
  });
});

describe("Object with subtypes", () => {
  it("should not take object with missing field", () => {
    const r = isObject({ foo: isString() }).parse({ a: "b" });
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is missing", ".foo"),
    });
  });

  it("should take object with missing optional field", () => {
    const r = isObject({ foo: isOptional(isString()) }).parse({ a: "b" });
    expect(r).toEqual({ ok: true, value: { a: "b" } });
  });

  it("should take object with valid required field", () => {
    const r = isObject({ a: isString() }).parse({ a: "b" });
    expect(r).toEqual({ ok: true, value: { a: "b" } });
  });

  it("should take object with valid optional field", () => {
    const r = isObject({ a: isOptional(isString()) }).parse({ a: "b" });
    expect(r).toEqual({ ok: true, value: { a: "b" } });
  });

  it("should not take object with deep missing field", () => {
    const r = isObject({ foo: isObject({ foo: isString() }) }).parse({
      foo: {},
    });
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is missing", ".foo.foo"),
    });
  });

  describe("Object with extra fields", () => {
    it("should keep extra fields on non-altering parse", () => {
      const r = isObject({ a: isNumber() }).parse({ a: 1, b: 2 });
      expect(r).toEqual({ ok: true, value: { a: 1, b: 2 } });
    });

    it("should keep extra fields on altering parse", () => {
      const r = isObject({ a: isNumber().mod((x) => x + 1) }).parse({
        a: 1,
        b: 2,
      });
      expect(r).toEqual({ ok: true, value: { a: 2, b: 2 } });
    });

    it("should DENY extra fields", () => {
      const r = isObject({ a: isNumber() }, { extraFields: "DENY" }).parse({
        a: 1,
        b: 2,
      });
      expect(r).toEqual({
        ok: false,
        error: new ParseError(`has extra field "b"`),
      });
    });

    it("should OMIT extra fields", () => {
      const r = isObject({ a: isNumber() }, { extraFields: "OMIT" }).parse({
        a: 1,
        b: 2,
      });
      expect(r).toEqual({ ok: true, value: { a: 1 } });
    });
  });
});
