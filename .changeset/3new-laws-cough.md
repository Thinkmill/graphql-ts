---
"@graphql-ts/schema": major
---

All of the GraphQL types returned by `@graphql-ts/schema` are now directly runtime compatible with the equivalent types from GraphQL.js instead of being on `.graphQLType`.

Handling this change should generally just require removing `.graphQLType` from where `@graphql-ts/schema` types are used with GraphQL.js, like this:

```diff
import { GraphQLSchema } from "graphql";

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
-   query: Query.graphQLType,
+   query: Query,
});
```

The types returned by `@graphql-ts/schema` are internally now extended classes of the equivalent types from GraphQL.js (though only in the types, at runtime they are re-exports). These new classes are exported from `@graphql-ts/schema` as `GObjectType` and etc. The constructors of the `G*` types can be used directly safely in place of the `g.*` functions in **some cases** though some are not safe and it's still recommended to use `g.*` to also have binding to the same context type without needed to provide it manually.
