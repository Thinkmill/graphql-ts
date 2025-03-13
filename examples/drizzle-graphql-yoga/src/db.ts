import { drizzle } from "drizzle-orm/libsql";
import * as dbSchema from "./db-schema.js";

export type DB = ReturnType<typeof createDb>;

export function createDb(url: string) {
  return drizzle(url, { schema: dbSchema });
}
