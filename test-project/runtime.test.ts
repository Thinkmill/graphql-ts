import { graphql } from "@graphql-ts/schema";
import { GraphQLSchema, graphql as runGraphQL } from "graphql";

test("a basic schema works", async () => {
  const Query = graphql.object()({
    name: "Query",
    fields: {
      hello: graphql.field({
        type: graphql.String,
        resolve() {
          return "something";
        },
      }),
    },
  });
  const graphQLSchema = new GraphQLSchema({
    query: Query.graphQLType,
  });
  const result = await runGraphQL({
    schema: graphQLSchema,
    source: "query { hello }",
  });
  expect(result).toEqual({ data: { hello: "something" } });
});
