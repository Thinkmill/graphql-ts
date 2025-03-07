---
"@graphql-ts/schema": major
---

The `g` export exported from `@graphql-ts/schema` directly is now deprecated. Using `initG` is now the recommended way to use `@graphql-ts/schema` instead of the instance of `g` exported by `@graphql-ts/schema` or creating multiple files to setup `g` though using those is still possible.

```ts
import { GraphQLSchema } from "graphql";
import { initG } from "@graphql-ts/schema";

type Context = {
  something: string;
};

const g = initG<Context>();
type g<T> = initG<T>;

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

All types available at `g.*` like `g.ObjectType<Source>` can written instead like `g<typeof g.object<Source>>`/`GObjectType<Source, Context>` instead of being accessible directly on `g`.
