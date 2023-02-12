import type { Parser } from "../base/parsing";

export type Parsed<T> = T extends Parser<infer V> ? V : never;
