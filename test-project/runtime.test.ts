import { g } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

test("a basic schema works", async () => {
  const Query = g.object()({
    name: "Query",
    fields: {
      hello: g.field({
        type: g.String,
        resolve() {
          return "something";
        },
      }),
    },
  });
  const graphQLSchema = new GraphQLSchema({
    query: Query,
  });
  const result = await graphql({
    schema: graphQLSchema,
    source: "query { hello }",
  });
  expect(result).toEqual({ data: { hello: "something" } });
});
