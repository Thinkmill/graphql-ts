import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todo = sqliteTable("todo", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text().notNull(),
  done: integer({ mode: "boolean" }).notNull().default(false),
});
