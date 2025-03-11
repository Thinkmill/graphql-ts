# @graphql-ts/extend

## 0.0.0-test-20250311071901

### Major Changes

- [#26](https://github.com/Thinkmill/graphql-ts/pull/26) [`a0d9ea204c6a3cf1b9fad600e52de8f9f1a2ac42`](https://github.com/Thinkmill/graphql-ts/commit/a0d9ea204c6a3cf1b9fad600e52de8f9f1a2ac42) Thanks [@emmatown](https://github.com/emmatown)! - The `Key` type parameter on `Field` has been replaced with a new type parameter (`SourceAtKey`) and represents essentially `Source[Key]` instead of `Key`. For example, a field like this can be written:

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

- [#17](https://github.com/Thinkmill/graphql-ts/pull/17) [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba) Thanks [@emmatown](https://github.com/emmatown)! - `graphql@15` is no longer supported. `graphql@16.0.0` or newer is now required.

- [#17](https://github.com/Thinkmill/graphql-ts/pull/17) [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba) Thanks [@emmatown](https://github.com/emmatown)! - The `wrap` export has been removed. Since the types in `@graphql-ts/schema@1.0.0` are compatible with the GraphQL.js types directly, these functions are no longer needed.

### Patch Changes

- Updated dependencies [[`a0d9ea204c6a3cf1b9fad600e52de8f9f1a2ac42`](https://github.com/Thinkmill/graphql-ts/commit/a0d9ea204c6a3cf1b9fad600e52de8f9f1a2ac42), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba), [`b651f3398fc9aadb59152cd51bc744c2405a9bb6`](https://github.com/Thinkmill/graphql-ts/commit/b651f3398fc9aadb59152cd51bc744c2405a9bb6), [`5d6be9c641ec8fa1bbb7587db5aab496227c38d6`](https://github.com/Thinkmill/graphql-ts/commit/5d6be9c641ec8fa1bbb7587db5aab496227c38d6), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba), [`083a8e59931b07580f1e57a91acecf0526d932ba`](https://github.com/Thinkmill/graphql-ts/commit/083a8e59931b07580f1e57a91acecf0526d932ba)]:
  - @graphql-ts/schema@0.0.0-test-20250311071901

## 1.0.3

### Patch Changes

- [#36](https://github.com/Thinkmill/graphql-ts/pull/36) [`692b08c5f7fdfb8e6aead74be2ea0841ba74dbad`](https://github.com/Thinkmill/graphql-ts/commit/692b08c5f7fdfb8e6aead74be2ea0841ba74dbad) Thanks [@emmatown](https://github.com/emmatown)! - Remove `@babel/runtime` dependency

## 1.0.2

### Patch Changes

- [#24](https://github.com/Thinkmill/graphql-ts/pull/24) [`2dc7f48a07f4e235261891dd0ff3bc4ca2ec9858`](https://github.com/Thinkmill/graphql-ts/commit/2dc7f48a07f4e235261891dd0ff3bc4ca2ec9858) Thanks [@emmatown](https://github.com/emmatown)! - Add support for `isOneOf` in input object types

- [`65f914c83a6438e8b326047c0dc3d83d47ba110c`](https://github.com/Thinkmill/graphql-ts/commit/65f914c83a6438e8b326047c0dc3d83d47ba110c) Thanks [@emmatown](https://github.com/emmatown)! - Simplify the build files in `dist`

## 1.0.1

### Patch Changes

- [#19](https://github.com/Thinkmill/graphql-ts/pull/19) [`d79115e1007e6e47b425293122818e7d40edf8b5`](https://github.com/Thinkmill/graphql-ts/commit/d79115e1007e6e47b425293122818e7d40edf8b5) Thanks [@emmatown](https://github.com/emmatown)! - Documentation updates to align with the renaming of the `graphql` export to `g` in `@graphql-ts/schema`

## 1.0.0

### Minor Changes

- [`012d84e`](https://github.com/Thinkmill/graphql-ts/commit/012d84e04bfe37c18aa0afdc541843586cf768bf) Thanks [@emmatown](https://github.com/emmatown)! - Added `exports` field

### Patch Changes

- Updated dependencies [[`012d84e`](https://github.com/Thinkmill/graphql-ts/commit/012d84e04bfe37c18aa0afdc541843586cf768bf)]:
  - @graphql-ts/schema@0.6.0

## 0.4.1

### Patch Changes

- [`ef18bba`](https://github.com/Thinkmill/graphql-ts/commit/ef18bba55773e38309f538b987099650ad66533d) Thanks [@emmatown](https://github.com/emmatown)! - Added declaration maps

* [`65391d3`](https://github.com/Thinkmill/graphql-ts/commit/65391d30c7a56313325acb647110e8536008d82b) Thanks [@emmatown](https://github.com/emmatown)! - `graphql@16` is now allowed in `peerDependencies`

## 0.4.0

### Minor Changes

- [`5d1c299`](https://github.com/Thinkmill/graphql-ts/commit/5d1c299ae50a8bafea8e409f9c2c1e5abedaa29a) Thanks [@emmatown](https://github.com/emmatown)! - Type parameters named `RootVal` have been renamed to `Source` and properties named `__rootVal` have been renamed to `__source`. This won't require code changes unless you've relied on the `__rootVal` properties(which you shouldn't).

* [`232cec8`](https://github.com/Thinkmill/graphql-ts/commit/232cec81c04c3489c053e24cfe37ab7f3d8a4265) Thanks [@emmatown](https://github.com/emmatown)! - `BaseSchemaInfo` has been renamed to `BaseSchemaMeta`

## 0.3.0

### Minor Changes

- [`c92bf61`](https://github.com/Thinkmill/graphql-ts/commit/c92bf61044af69d72003a076b2a191ff685633fb) Thanks [@emmatown](https://github.com/emmatown)! - An array of extensions can now be passed to `extend`

## 0.2.0

### Minor Changes

- [`42f4abe`](https://github.com/Thinkmill/graphql-ts/commit/42f4abe6ad5e6b1bfec3eb7acfad0e54721c63cb) Thanks [@emmatown](https://github.com/emmatown)! - Added `wrap` export to wrap graphql-js types into @graphql-ts/schema types and expand the functions on `BaseSchemaInfo` to all GraphQL types

## 0.1.0

### Minor Changes

- [`3b6d533`](https://github.com/Thinkmill/graphql-ts/commit/3b6d533f9e76c54341610346e1e7bcab29f6826b) Thanks [@emmatown](https://github.com/emmatown)! - Initial release. This package is very early and will have many breaking changes.
