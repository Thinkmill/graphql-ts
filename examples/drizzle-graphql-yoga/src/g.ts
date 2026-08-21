import { gWithContext } from "@graphql-ts/schema";
import type { DB } from "./db.ts";

export type Context = {
  db: DB;
};

export const g = gWithContext<Context>();
export type g<T> = gWithContext.infer<T>;
