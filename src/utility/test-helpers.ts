import { expect } from "vitest";

import type { ParseError } from "../base/error";
import type { Failure, Success } from "../base/result";

export function expectSuccess(x: unknown, value?: unknown): Success<unknown> {
  const obj: { ok: boolean; value?: unknown } = { ok: true };
  if (value !== undefined) {
    obj.value = value;
  }
  expect(x).toMatchObject(obj);
  return x as Success<unknown>;
}

export function expectFailure(x: unknown, error?: ParseError): Failure {
  const obj: { ok: boolean; error?: ParseError } = { ok: false };
  if (error !== undefined) {
    obj.error = error;
  }
  expect(x).toMatchObject(obj);
  return x as Failure;
}
