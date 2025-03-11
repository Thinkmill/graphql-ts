---
"@graphql-ts/extend": major
"@graphql-ts/schema": major
---

The `Key` type parameter on `Field` has been replaced with a new type parameter (`SourceAtKey`) and represents essentially `Source[Key]` instead of `Key`. For example, a field like this can be written:

```ts
const field = g.field({
  type: g.String,
});
```

and `field` will be usable like this:

```ts
const Something = g.object<{
  name: string
}>({
  name: "Something"
  fields: {
    name: field,
    // @ts-expect-error
    other: field
  },
});
```

The field is usable at `name` since the source type has an object with a `name` property that's a `string` but using it at `other` will result in a type error since the source type doesn't have a `other` property.

Previously, using `g.field` outside a `g.object`/`g.fields` call would require specifying a resolver and fields written within `g.fields` would be bound to be used at a specific key rather than the new behaviour of any key with the right type.

This also reduces the need for `g.fields`. For example, the example given in the previous JSDoc for `g.fields`:

```ts
const nodeFields = g.fields<{ id: string }>()({
  id: g.field({ type: g.ID }),
});
const Node = g.interface<{ id: string }>()({
  name: "Node",
  fields: nodeFields,
});
const Person = g.object<{
  __typename: "Person";
  id: string;
  name: string;
}>()({
  name: "Person",
  interfaces: [Node],
  fields: {
    ...nodeFields,
    name: g.field({ type: g.String }),
  },
});
```

Now the `g.fields` call is unnecessary and writing `nodeFields` will no longer error at the `g.field` call and will instead work as expected.

```ts
const nodeFields = {
  id: g.field({ type: g.ID }),
};
```

There is still some use to `g.fields` for when you want to define a number of shared fields with resolvers and specify the source type just once in the `g.fields` call rathe than in every resolver.

This change is unlikely to break existing code except where you explicitly use the `Field` type or explicitly pass type parameters to `g.field` (the latter of which you likely shouldn't do) but since it changes the meaning of a type parameter of `Field`, it's regarded as a breaking change.
