import { schema } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

test("a basic schema works", async () => {
  const Query = schema.object()({
    name: "Query",
    fields: {
      hello: schema.field({
        type: schema.String,
        resolve() {
          return "something";
        },
      }),
    },
  });
  const graphQLSchema = new GraphQLSchema({
    query: Query.graphQLType,
  });
  const result = await graphql({
    schema: graphQLSchema,
    source: "query { hello }",
  });
  expect(result).toEqual({ data: { hello: "something" } });
});
