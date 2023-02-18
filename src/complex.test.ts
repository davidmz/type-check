import { describe, expect, it } from "vitest";

import { isArray } from "./complex/array";
import { isString } from "./primitives";
import { expectSuccess } from "./utility/test-helpers";

describe("Complex", () => {
  it(`should parse and keep array unmodified`, () => {
    const data = ["foo", "bar"];
    const parser = isArray(isString());
    const result = expectSuccess(parser.parse(data));

    expect(result.value).toBe(data);
    expect(data).toEqual(["foo", "bar"]);
  });

  it(`should parse with 'req' and keep array unmodified`, () => {
    const data = ["foo", "bar"];
    const parser = isArray(isString().and((x) => x.length > 0));
    const result = expectSuccess(parser.parse(data));

    expect(result.value).toBe(data);
    expect(data).toEqual(["foo", "bar"]);
  });

  it(`should parse and create modified copy of array`, () => {
    const data = ["foo", "bar"];
    const parser = isArray(isString().andAlter((x) => x.toUpperCase()));
    const result = expectSuccess(parser.parse(data));

    expect(result.value).not.toBe(data);
    expect(data).toEqual(["foo", "bar"]);
  });

  it(`should parse and create modified copy of array (2)`, () => {
    const data = ["foo", "bar"];
    const parser = isArray(
      isString()
        .andAlter((x) => x.toUpperCase())
        .and(() => true) // noop, but has .altering === false
    );
    const result = expectSuccess(parser.parse(data));

    expect(result.value).toEqual(["FOO", "BAR"]);
    expect(data).toEqual(["foo", "bar"]);
  });
});
