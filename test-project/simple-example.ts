import { gWithContext } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

type Context = {};

const g = gWithContext<Context>();
type g<T> = gWithContext.infer<T>;

const Query = g.object()({
  name: "Query",
  fields: {
    hello: g.field({
      type: g.String,
      resolve() {
        return "Hello!";
      },
    }),
  },
});

const schema = new GraphQLSchema({
  query: Query,
});

graphql({
  source: `
      query {
        hello
      }
    `,
  schema,
}).then((result) => {
  console.log(result);
});
