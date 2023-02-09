import { describe, expect, it } from "vitest";

import type { Success } from "./base/result";
import { success } from "./base/result";
import { isString } from "./primitives";
import { isEqual } from "./utility";

describe("Primitives", () => {
  it("should parse string as string", () => {
    const res = isString().parse("foo");
    expect(res.ok).toBe(true);
  });

  it("should parse number as string (with error)", () => {
    const res = isString().parse(42);
    expect(res.ok).toBe(false);
  });

  it("should parse string with length limit", () => {
    const res = isString()
      .and((x) => x.length > 5)
      .parse("foo");
    expect(res.ok).toBe(false);
  });

  it("should parse string with length limit (with error)", () => {
    const res = isString()
      .and((x) => x.length < 5)
      .parse("foo");
    expect(res.ok).toBe(true);
  });

  it("should transform string to number", () => {
    const res = isString()
      .andAlter((x) => x.length)
      .parse("foo");
    expect(res.ok).toBe(true);
    expect((res as Success<number>).value).toBe(3);
  });

  it("should transform string to uppercase", () => {
    const res = isString()
      .andAlter((x) => x.toUpperCase())
      .parse("foo");
    expect(res.ok).toBe(true);
    expect((res as Success<string>).value).toBe("FOO");
  });

  it("should test for constant", () => {
    const res = isEqual(42).parse(42);
    expect(res).toEqual({ ok: true, value: 42 });
  });

  it("should test for constant (and fail)", () => {
    const res = isEqual(42 as const).parse(43);
    expect(res.ok).toBe(false);
  });

  it("should work with fallback", () => {
    const p = isString()
      .and((x) => x.length > 3)
      .fallback("123");
    expect(p.parse("fooo")).toEqual(success("fooo"));
    expect(p.parse("foo")).toEqual(success("123"));
    expect(p.parse(321)).toEqual(success("123"));
  });
});
