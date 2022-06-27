---
"@graphql-ts/schema": patch
---

Fixed having a union of `Arg`s where at least one is nullable without a default value not resulting in an inferred input type that includes `undefined` in the union.

```ts
graphql.field({
  type: graphql.String,
  args: {
    something: graphql.arg({
      type:
        Math.random() > 0.5 ? graphql.nonNull(graphql.String) : graphql.String,
    }),
  },
  resolve(source, { something }) {
    // this previously incorrectly did not cause an error, it will now error
    const a: string | null = something;
    // it should be this:
    const b: string | null | undefined = something;
    return "";
  },
});
```
