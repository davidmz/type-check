import { describe, expect, it } from "vitest";

import { ParseError } from "../base/error";
import { isNumber, isString } from "../primitives";
import { expectFailure, expectSuccess } from "../utility/test-helpers";
import { isTuple } from "./tuple";

describe("Tuple", () => {
  const p = isTuple(isString(), isNumber(), isTuple(isString(), isNumber()));
  const pAltering = isTuple(
    isString(),
    isNumber(),
    isTuple(
      isString().andAlter((x) => x.toUpperCase()),
      isNumber()
    )
  );

  it("should not take non-array", () => {
    expectFailure(p.parse(43), new ParseError("is not an array"));
  });

  it("should not take array with invalid length", () => {
    expectFailure(p.parse([43, 44]), new ParseError("has invalid length"));
  });

  it("should not take array with extra length", () => {
    expectFailure(
      p.parse([43, 44, 45, 46]),
      new ParseError("has invalid length")
    );
  });

  it("should not take array with invalid types", () => {
    expectFailure(
      p.parse(["43", 44, []]),
      new ParseError("has invalid length", "[2]")
    );
  });

  it("should not take array with invalid types in deep", () => {
    expectFailure(
      p.parse(["43", 44, [45, 46]]),
      new ParseError("is not a string", "[2][0]")
    );
  });

  it("should take valid array", () => {
    const t = ["43", 44, ["45", 46]];
    const r = expectSuccess(p.parse(t));
    expect(r.value).toBe(t);
  });

  it("should take and modify valid array", () => {
    const t = ["foo", 44, ["bar", 46]];
    const r = expectSuccess(pAltering.parse(t));
    expect(r.value).not.toBe(t);
  });
});
