# @graphql-ts/schema

## 0.6.4

### Patch Changes

- [#36](https://github.com/Thinkmill/graphql-ts/pull/36) [`692b08c5f7fdfb8e6aead74be2ea0841ba74dbad`](https://github.com/Thinkmill/graphql-ts/commit/692b08c5f7fdfb8e6aead74be2ea0841ba74dbad) Thanks [@emmatown](https://github.com/emmatown)! - Remove `@babel/runtime` dependency

## 0.6.3

### Patch Changes

- [#32](https://github.com/Thinkmill/graphql-ts/pull/32) [`91a28cb0b8eedf4a66dca624afc71de07d1c3a11`](https://github.com/Thinkmill/graphql-ts/commit/91a28cb0b8eedf4a66dca624afc71de07d1c3a11) Thanks [@emmatown](https://github.com/emmatown)! - Revert changes to internal `FieldFuncResolve` type which broke parts of inference in a very small number of cases

- [#29](https://github.com/Thinkmill/graphql-ts/pull/29) [`7756410781a21ba77616c8fbf6b36e7ab211200f`](https://github.com/Thinkmill/graphql-ts/commit/7756410781a21ba77616c8fbf6b36e7ab211200f) Thanks [@emmatown](https://github.com/emmatown)! - Improve types that enforce correct fields are provided when `interfaces` are passed to `g.object`/`g.interface`

- [#29](https://github.com/Thinkmill/graphql-ts/pull/29) [`7756410781a21ba77616c8fbf6b36e7ab211200f`](https://github.com/Thinkmill/graphql-ts/commit/7756410781a21ba77616c8fbf6b36e7ab211200f) Thanks [@emmatown](https://github.com/emmatown)! - Deprecate `InterfaceToInterfaceFields` and `InterfacesToOutputFields` types.

## 0.6.2

### Patch Changes

- [#24](https://github.com/Thinkmill/graphql-ts/pull/24) [`2dc7f48a07f4e235261891dd0ff3bc4ca2ec9858`](https://github.com/Thinkmill/graphql-ts/commit/2dc7f48a07f4e235261891dd0ff3bc4ca2ec9858) Thanks [@emmatown](https://github.com/emmatown)! - Add support for `isOneOf` in input object types

- [#25](https://github.com/Thinkmill/graphql-ts/pull/25) [`974bdd8f2d1ca72b04dfde471fa4e119b2d1a7b1`](https://github.com/Thinkmill/graphql-ts/commit/974bdd8f2d1ca72b04dfde471fa4e119b2d1a7b1) Thanks [@emmatown](https://github.com/emmatown)! - Simplify internal `FieldFuncResolve` type

- [`65f914c83a6438e8b326047c0dc3d83d47ba110c`](https://github.com/Thinkmill/graphql-ts/commit/65f914c83a6438e8b326047c0dc3d83d47ba110c) Thanks [@emmatown](https://github.com/emmatown)! - Simplify the build files in `dist`

## 0.6.1

### Patch Changes

- [#19](https://github.com/Thinkmill/graphql-ts/pull/19) [`d79115e1007e6e47b425293122818e7d40edf8b5`](https://github.com/Thinkmill/graphql-ts/commit/d79115e1007e6e47b425293122818e7d40edf8b5) Thanks [@emmatown](https://github.com/emmatown)! - The `graphql` export has been renamed to `g` to make reading/writing schemas more concise and to avoid conflicts with exports named `graphql` from libraries such as Relay, GraphQL Code Generator and gql.tada that use the variable name `graphql` to declare GraphQL operations.

  The `graphql` export still exists but is now deprecated and may be removed in a future release.

  To quickly update usages of the `graphql` export in your project to use `g`:

  1. Navigate to `node_modules/@graphql-ts/schema/dist/declarations/src/schema-api-alias.d.ts` in your editor ("Go to Definition" will not take you to the correct file)
  2. Use "Rename Symbol" to rename `graphql` to `g`, this will update usages of `graphql` to `g`
  3. Change this deprecated alias back from `g` to `graphql` (avoid using "Rename Symbol" again because you want to preserve the updates you made in step 2)

  You can similarly use "Rename Symbol" to quickly rename your own custom defined `graphql` to `g`.

## 0.6.0

### Minor Changes

- [`012d84e`](https://github.com/Thinkmill/graphql-ts/commit/012d84e04bfe37c18aa0afdc541843586cf768bf) Thanks [@emmatown](https://github.com/emmatown)! - Added `exports` field

## 0.5.3

### Patch Changes

- [`3663690`](https://github.com/Thinkmill/graphql-ts/commit/3663690f9063c72933465a6ee369795f8d1d864e) Thanks [@emmatown](https://github.com/emmatown)! - Fixed having a union of `Arg`s where at least one is nullable without a default value not resulting in an inferred input type that includes `undefined` in the union.

  ```ts
  graphql.field({
    type: graphql.String,
    args: {
      something: graphql.arg({
        type:
          Math.random() > 0.5
            ? graphql.nonNull(graphql.String)
            : graphql.String,
      }),
    },
    resolve(source, { something }) {
      const previouslyIncorrectlyAllowedNowError: string | null = something;
      const correct: string | null | undefined = something;
      return "";
    },
  });
  ```

## 0.5.2

### Patch Changes

- [`3e4909f`](https://github.com/Thinkmill/graphql-ts/commit/3e4909f3885a0edf3d989f8ce598f91473f97446) Thanks [@emmatown](https://github.com/emmatown)! - Fixed `Field<_, _, _, string, _>` not being assignable to `Field<_, _, _, "literal", _>`

## 0.5.1

### Patch Changes

- [`ef18bba`](https://github.com/Thinkmill/graphql-ts/commit/ef18bba55773e38309f538b987099650ad66533d) Thanks [@emmatown](https://github.com/emmatown)! - Added declaration maps

* [`65391d3`](https://github.com/Thinkmill/graphql-ts/commit/65391d30c7a56313325acb647110e8536008d82b) Thanks [@emmatown](https://github.com/emmatown)! - `graphql@16` is now allowed in `peerDependencies`

## 0.5.0

### Minor Changes

- [`5d1c299`](https://github.com/Thinkmill/graphql-ts/commit/5d1c299ae50a8bafea8e409f9c2c1e5abedaa29a) Thanks [@emmatown](https://github.com/emmatown)! - Type parameters named `RootVal` have been renamed to `Source` and properties named `__rootVal` have been renamed to `__source`. This won't require code changes unless you've relied on the `__rootVal` properties(which you shouldn't).

## 0.4.0

### Minor Changes

- [`910d1ed`](https://github.com/Thinkmill/graphql-ts/commit/910d1edc596f4a17b0a3dec3e3df8ebd94a5cb80) Thanks [@emmatown](https://github.com/emmatown)! - Replaced `fields` property on `InterfaceType` with `__fields` that does not exist at runtime to align with other types

### Patch Changes

- [`6c85396`](https://github.com/Thinkmill/graphql-ts/commit/6c85396eee29d6eea75c43f54e50b90a3e63a266) Thanks [@emmatown](https://github.com/emmatown)! - Updated the definition of `graphql.union` so that the `Context` of the `UnionType` returned and the `Context` passed to `resolveType` are determined by the `Context` of the `graphql` object rather than a union of the `Context`s of the union's member types.

## 0.3.1

### Patch Changes

- [`1e10a22`](https://github.com/Thinkmill/graphql-ts/commit/1e10a228e59b206f86e963d423567486fa590aab) Thanks [@emmatown](https://github.com/emmatown)! - Fixed broken links in JSDoc comments

## 0.3.0

### Minor Changes

- [`6e9a2fb`](https://github.com/Thinkmill/graphql-ts/commit/6e9a2fb1b5dd2965bc9e2783dfddd8a2bacf88f6) Thanks [@emmatown](https://github.com/emmatown)! - Renamed the following exports:

  - `schema` → `graphql`
  - `bindSchemaAPIToContext` → `bindGraphQLSchemaAPIToContext`
  - `SchemaAPIWithContext` → `GraphQLSchemaAPIWithContext`

## 0.2.0

### Minor Changes

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@emmatown](https://github.com/emmatown)! - Removed `MaybeFunc` export

* [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@emmatown](https://github.com/emmatown)! - Changed the second type parameter of `Arg` from `DefaultValue extends InferValueFromInputType<Type> | undefined = InferValueFromInputType<Type> | undefined` to `HasDefaultValue extends boolean = boolean`. This makes it easier to type circular input objects because you TypeScript won't emit a circularity error and require you to provide a value for the second type parameter. For example, previously to type a circular input object, it looked like this where `undefined` had to be passed:

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

### Patch Changes

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@emmatown](https://github.com/emmatown)! - Fixed list types that contain output types being assignable to `NullableInputType`/`InputType`

* [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@emmatown](https://github.com/emmatown)! - JSDoc improvements

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@emmatown](https://github.com/emmatown)! - Resolvers are now allowed to return `undefined` in addition to `null` for fields with nullable output types along with optional properties on a `RootVal` without a resolver being allowed. Resolvers still cannot return `void`(no return) and a property being missing from a `RootVal` without a resolver is still disallowed.

## 0.1.2

### Patch Changes

- [`6e4562f`](https://github.com/Thinkmill/graphql-ts/commit/6e4562fbeaf0c3e1b2dfba215bfe08cd957ae8fd) Thanks [@emmatown](https://github.com/emmatown)! - Updated mentions of `types.` to `schema.` in JSDoc comments

## 0.1.1

### Patch Changes

- [`25e4344`](https://github.com/Thinkmill/graphql-ts/commit/25e4344764f509152e1bae47f09b9633026db517) Thanks [@emmatown](https://github.com/emmatown)! - When using list types, you can now return iterables instead of only arrays from resolvers

* [`25e4344`](https://github.com/Thinkmill/graphql-ts/commit/25e4344764f509152e1bae47f09b9633026db517) Thanks [@emmatown](https://github.com/emmatown)! - Added JSDoc comments to most fields on `SchemaAPIWithContext`

## 0.1.0

### Minor Changes

- [`2c9d25a`](https://github.com/Thinkmill/graphql-ts/commit/2c9d25ab7724a8a460b337a4a529accc0d3169ec) Thanks [@emmatown](https://github.com/emmatown)! - Initial release
