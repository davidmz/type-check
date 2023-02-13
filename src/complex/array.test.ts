import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isString } from "../primitives";
import { expectFailure, expectSuccess } from "../utility/test-helpers";
import { isArray } from "./array";

describe("Array without subtypes", () => {
  it("should not take non-array", () => {
    expectFailure(isArray().parse(42), new ParseError("is not an array"));
  });

  it("should take empty array", () => {
    expectSuccess(isArray().parse([]));
  });

  it("should not take array of invalid length", () => {
    const r = isArray(2).parse([1, "2", {}]);
    expectFailure(r, new ParseError("has invalid length"));
  });

  it("should take array of valid length", () => {
    expectSuccess(isArray(3).parse([1, "2", {}]));
  });
});

describe("Array with type", () => {
  const p = isArray(isString());
  const pAltering = isArray(isString().andAlter((x) => x.toUpperCase()));

  it("should not take non-array", () => {
    expectFailure(p.parse(43), new ParseError("is not an array"));
  });

  it("should not take array with invalid types", () => {
    expectFailure(
      p.parse(["43", 44, []]),
      new ParseError("is not a string", "[1]")
    );
  });

  it("should not take array with invalid types in deep", () => {
    const r = isArray(isArray(isString())).parse([["43"], ["45", 46]]);
    expectFailure(r, new ParseError("is not a string", "[1][1]"));
  });

  it("should take valid array", () => {
    const t = ["43", "45"];
    const r = expectSuccess(p.parse(t));
    expect(r.value).toBe(t);
  });

  it("should take and modify valid array", () => {
    const t = ["foo", "bar"];
    const r = pAltering.parse(t);
    expectSuccess(r, ["FOO", "BAR"]);
    expect(r.value).not.toBe(t);
  });
});
