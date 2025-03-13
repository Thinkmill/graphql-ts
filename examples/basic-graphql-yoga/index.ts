import { gWithContext } from "@graphql-ts/schema";
import { GraphQLSchema } from "graphql";
import { createYoga } from "graphql-yoga";
import { createServer } from "http";

type Context = {};

const g = gWithContext<Context>();
type g<T> = gWithContext.infer<T>;

const Query = g.object()({
  name: "Query",
  fields: {
    hello: g.field({ type: g.String, resolve: () => "world" }),
  },
});

const schema = new GraphQLSchema({ query: Query });

const yoga = createYoga({ schema });
const server = createServer(yoga);
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
