# @graphql-ts/schema

## 0.3.1

### Patch Changes

- [`1e10a22`](https://github.com/Thinkmill/graphql-ts/commit/1e10a228e59b206f86e963d423567486fa590aab) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed broken links in JSDoc comments

## 0.3.0

### Minor Changes

- [`6e9a2fb`](https://github.com/Thinkmill/graphql-ts/commit/6e9a2fb1b5dd2965bc9e2783dfddd8a2bacf88f6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed the following exports:

  - `schema` → `graphql`
  - `bindSchemaAPIToContext` → `bindGraphQLSchemaAPIToContext`
  - `SchemaAPIWithContext` → `GraphQLSchemaAPIWithContext`

## 0.2.0

### Minor Changes

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `MaybeFunc` export

* [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed the second type parameter of `Arg` from `DefaultValue extends InferValueFromInputType<Type> | undefined = InferValueFromInputType<Type> | undefined` to `HasDefaultValue extends boolean = boolean`. This makes it easier to type circular input objects because you TypeScript won't emit a circularity error and require you to provide a value for the second type parameter. For example, previously to type a circular input object, it looked like this where `undefined` had to be passed:

  ```ts
  type CircularInputType = schema.InputObjectType<{
    circular: schema.Arg<typeof Circular, undefined>;
  }>;

  const Circular: CircularInputType = schema.inputObject({
    name: "Circular",
    fields: () => ({
      circular: schema.arg({ type: Circular })
    })
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
      circular: schema.arg({ type: Circular })
    })
  });
  ```

### Patch Changes

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed list types that contain output types being assignable to `NullableInputType`/`InputType`

* [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - JSDoc improvements

- [#5](https://github.com/Thinkmill/graphql-ts/pull/5) [`9f2e0fa`](https://github.com/Thinkmill/graphql-ts/commit/9f2e0fab2c7c483c3f4c13b285d6a33e75bb563c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Resolvers are now allowed to return `undefined` in addition to `null` for fields with nullable output types along with optional properties on a `RootVal` without a resolver being allowed. Resolvers still cannot return `void`(no return) and a property being missing from a `RootVal` without a resolver is still disallowed.

## 0.1.2

### Patch Changes

- [`6e4562f`](https://github.com/Thinkmill/graphql-ts/commit/6e4562fbeaf0c3e1b2dfba215bfe08cd957ae8fd) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated mentions of `types.` to `schema.` in JSDoc comments

## 0.1.1

### Patch Changes

- [`25e4344`](https://github.com/Thinkmill/graphql-ts/commit/25e4344764f509152e1bae47f09b9633026db517) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - When using list types, you can now return iterables instead of only arrays from resolvers

* [`25e4344`](https://github.com/Thinkmill/graphql-ts/commit/25e4344764f509152e1bae47f09b9633026db517) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added JSDoc comments to most fields on `SchemaAPIWithContext`

## 0.1.0

### Minor Changes

- [`2c9d25a`](https://github.com/Thinkmill/graphql-ts/commit/2c9d25ab7724a8a460b337a4a529accc0d3169ec) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
