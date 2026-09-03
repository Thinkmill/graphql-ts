import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-sqlite";
import * as dbSchema from "./db-schema.ts";

export type DB = ReturnType<typeof createDb>;

const relations = defineRelations(dbSchema);

export function createDb(url: string) {
  return drizzle(url, { relations });
}
