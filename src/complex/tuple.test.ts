import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isNumber, isString } from "../primitives";
import { isTuple } from "./tuple";

describe("Tuple", () => {
  const p = isTuple(isString(), isNumber(), isTuple(isString(), isNumber()));
  const pAltering = isTuple(
    isString(),
    isNumber(),
    isTuple(
      isString().mod((x) => x.toUpperCase()),
      isNumber()
    )
  );

  it("should not take non-array", () => {
    const r = p.parse(43);
    expect(r).toEqual({ ok: false, error: new ParseError("is not an array") });
  });

  it("should not take array with invalid length", () => {
    const r = p.parse([43, 44]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("has invalid length"),
    });
  });

  it("should not take array with extra length", () => {
    const r = p.parse([43, 44, 45, 46]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("has invalid length"),
    });
  });

  it("should not take array with invalid types", () => {
    const r = p.parse(["43", 44, []]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("has invalid length", "[2]"),
    });
  });

  it("should not take array with invalid types in deep", () => {
    const r = p.parse(["43", 44, [45, 46]]);
    expect(r).toEqual({
      ok: false,
      error: new ParseError("is not a string", "[2][0]"),
    });
  });

  it("should take valid array", () => {
    const t = ["43", 44, ["45", 46]];
    const r = p.parse(t);
    expect(r).toEqual({ ok: true, value: t });
    r.ok && expect(r.value).toBe(t);
  });

  it("should take and modify valid array", () => {
    const t = ["foo", 44, ["bar", 46]];
    const r = pAltering.parse(t);
    expect(r).toEqual({ ok: true, value: ["foo", 44, ["BAR", 46]] });
    r.ok && expect(r.value).not.toBe(t);
  });
});
