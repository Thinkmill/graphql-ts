# @graphql-ts/schema

`@graphql-ts/schema` is a thin wrapper around
[GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
constructing GraphQL Schemas while avoiding type-generation, [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
and [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).

```ts
import { graphql } from "@graphql-ts/schema";
import { GraphQLSchema, graphql as runGraphQL } from "graphql";

const Query = graphql.object()({
  name: "Query",
  fields: {
    hello: graphql.field({
      type: graphql.String,
      resolve() {
        return "Hello!";
      },
    }),
  },
});

const schema = new GraphQLSchema({
  query: Query.graphQLType,
});

runGraphQL({
  source: `
    query {
      hello
    }
  `,
  schema,
}).then((result) => {
  console.log(result);
});
```
