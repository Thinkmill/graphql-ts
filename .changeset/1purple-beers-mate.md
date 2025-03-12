---
"@graphql-ts/schema": major
---

The `g` and `graphql` exports from `@graphql-ts/schema` have been removed. You should now use `gWithContext` to bind `g` to a specific context type.

```ts
import { GraphQLSchema } from "graphql";
import { gWithContext } from "@graphql-ts/schema";

type Context = {
  something: string;
};

const g = gWithContext<Context>();
type g<T> = gWithContext.infer<T>;

const Query = g.object()({
  name: "Query",
  fields: {
    something: g.field({
      type: g.String,
      resolve(_, __, context) {
        return context.something;
      },
    }),
  },
});

const schema = new GraphQLSchema({
  query: Query,
});
```

All types available at `g.*` like `g.ObjectType<Source>` can written instead like `g<typeof g.object<Source>>` or from types available from `@graphql-ts/schema` instead of being accessible directly on `g`.
