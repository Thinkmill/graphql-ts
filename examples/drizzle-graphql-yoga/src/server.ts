import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema.js";
import type { Context } from "./g.js";
import { createDb } from "./db.js";

const yoga = createYoga({
  schema,
  context: (): Context => ({ db: createDb("./dev.db") }),
});

const server = createServer(yoga);
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
