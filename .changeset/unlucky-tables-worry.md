---
"@graphql-ts/schema": minor
---

Changed the second type parameter of `Arg` from `DefaultValue extends InferValueFromInputType<Type> | undefined = InferValueFromInputType<Type> | undefined` to `HasDefaultValue extends boolean = boolean`. This makes it easier to type circular input objects because you TypeScript won't emit a circularity error and require you to provide a value for the second type parameter. For example, previously to type a circular input object, it looked like this where `undefined` had to be passed:

```ts
type CircularInputType = schema.InputObjectType<{
  circular: schema.Arg<typeof Circular, undefined>;
}>;

const Circular: CircularInputType = schema.inputObject({
  name: "Circular",
  fields: () => ({
    circular: schema.arg({ type: Circular }),
  }),
});
```

Now, the `undefined` type parameter can be removed

```ts
type CircularInputType = schema.InputObjectType<{
  circular: schema.Arg<typeof Circular>;
}>;

const Circular: CircularInputType = schema.inputObject({
  name: "Circular",
  fields: () => ({
    circular: schema.arg({ type: Circular }),
  }),
});
```
