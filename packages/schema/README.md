# @graphql-ts/schema

`@graphql-ts/schema` is a thin wrapper around
[GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
constructing GraphQL Schemas while avoiding type-generation, [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
and [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).

```ts
import { g } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

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
  query: Query.graphQLType,
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
```
