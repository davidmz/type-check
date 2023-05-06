import { describe, it } from "vitest";

import { ParseError } from "../base/error";
import { isEqual } from "./equal";
import { expectFailure, expectSuccess } from "./test-helpers";

describe("isEqual", () => {
  it("should pass valid value", () => {
    const p = isEqual(42);
    expectSuccess(p.parse(42), 42);
  });

  it("should not pass valid value", () => {
    const p = isEqual(42);
    expectFailure(
      p.parse("42"),
      new ParseError("is not equal to desired value")
    );
  });
});
