import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isString } from "../primitives";
import { isArray } from "./array";

describe("Array without subtypes", () => {
  it("should not take non-array", () => {
    const r = isArray().parse(42);
    expect(r).toEqual({ ok: false, error: new ParseError("is not an array") });
  });

  it("should take empty array", () => {
    const r = isArray().parse([]);
    expect(r).toEqual({ ok: true, value: [] });
  });

  it("should not take array of invalid length", () => {
    const r = isArray(2).parse([1, "2", {}]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("has invalid length"),
    });
  });

  it("should take array of valid length", () => {
    const r = isArray(3).parse([1, "2", {}]);
    expect(r).toEqual({ ok: true, value: [1, "2", {}] });
  });
});

describe("Array with type", () => {
  const p = isArray(isString());
  const pAltering = isArray(isString().andAlter((x) => x.toUpperCase()));

  it("should not take non-array", () => {
    const r = p.parse(43);
    expect(r).toEqual({ ok: false, error: new ParseError("is not an array") });
  });

  it("should not take array with invalid types", () => {
    const r = p.parse(["43", 44, []]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a string", "[1]"),
    });
  });

  it("should not take array with invalid types in deep", () => {
    const r = isArray(isArray(isString())).parse([["43"], ["45", 46]]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a string", "[1][1]"),
    });
  });

  it("should take valid array", () => {
    const t = ["43", "45"];
    const r = p.parse(t);
    expect(r).toEqual({ ok: true, value: t });
    r.ok && expect(r.value).toBe(t);
  });

  it("should take and modify valid array", () => {
    const t = ["foo", "bar"];
    const r = pAltering.parse(t);
    expect(r).toEqual({ ok: true, value: ["FOO", "BAR"] });
    r.ok && expect(r.value).not.toBe(t);
  });
});
