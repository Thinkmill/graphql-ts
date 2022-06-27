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
    const previouslyIncorrectlyAllowedNowError: string | null = something;
    const correct: string | null | undefined = something;
    return "";
  },
});
```
