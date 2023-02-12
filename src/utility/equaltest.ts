import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isEqual } from "./equal";

describe("isEqual", () => {
  it("should pass valid value", () => {
    const p = isEqual(42);
    expect(p.parse(42)).toEqual({ ok: true, value: 42 });
  });

  it("should not pass valid value", () => {
    const p = isEqual(42);
    expect(p.parse("42")).toEqual({
      ok: false,
      error: new ParseError("is not equal to desired value"),
    });
  });
});
