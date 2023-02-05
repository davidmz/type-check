import type { Parser } from "../base/parsing";

const optional = Symbol("optional");
type Optional<T> = T & { [optional]?: true };
type UnOptional<T> = T extends Optional<infer U> ? U : never;

type OptionalKeys<T> = {
  [K in keyof T]: T[K] extends Optional<unknown> ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends Optional<unknown> ? never : K;
}[keyof T];

type WithOptionalValues<T> = {
  [K in OptionalKeys<T>]?: UnOptional<T[K]>;
};

type WithRequiredValues<T> = {
  [K in RequiredKeys<T>]: T[K];
};

type Flat<T> = {
  [K in keyof T]: T[K];
};

export type WithOptionals<T> = Flat<
  WithOptionalValues<T> & WithRequiredValues<T>
>;

const optionalParsers = new WeakSet<Parser<unknown>>();

export function isOptional<T>(p: Parser<T>) {
  // Clone
  const opt = p.req(() => true) as Parser<Optional<T>>;
  optionalParsers.add(opt);
  return opt;
}

export function isOptionalParser(p: Parser<unknown>) {
  return optionalParsers.has(p);
}
