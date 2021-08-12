# @graphql-ts/schema

## 0.2.0

### Minor Changes

- [`77f8d9e`](https://github.com/Thinkmill/graphql-ts/commit/77f8d9eddc27b29bf4922ef6c0f1774881e27dcf) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `MaybeFunc` export

* [`a50c5c1`](https://github.com/Thinkmill/graphql-ts/commit/a50c5c1f147b7df1241e81d2251d2c3a8f5a303b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed the second type parameter of `Arg` from `DefaultValue extends InferValueFromInputType<Type> | undefined = InferValueFromInputType<Type> | undefined` to `HasDefaultValue extends boolean = boolean`. This makes it easier to type circular input objects because you TypeScript won't emit a circularity error and require you to provide a value for the second type parameter. For example, previously to type a circular input object, it looked like this where `undefined` had to be passed:

  ```ts
  const Circular: schema.InputObjectType<{
    circular: schema.Arg<typeof Circular, undefined>;
  }> = schema.inputObject({
    name: "Circular",
    fields: () => ({
      circular: schema.arg({ type: Circular })
    })
  });
  ```

  Now, that type parameter can be removed

  ```ts
  const Circular: schema.InputObjectType<{
    circular: schema.Arg<typeof Circular>;
  }> = schema.inputObject({
    name: "Circular",
    fields: () => ({
      circular: schema.arg({ type: Circular })
    })
  });
  ```

### Patch Changes

- [`b1af1a2`](https://github.com/Thinkmill/graphql-ts/commit/b1af1a295877e3bb111cf269084ef5aa0dc9530c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed list types that contain output types being assignable to `NullableInputType`/`InputType`

* [`b1af1a2`](https://github.com/Thinkmill/graphql-ts/commit/b1af1a295877e3bb111cf269084ef5aa0dc9530c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - JSDoc improvements

- [`77f8d9e`](https://github.com/Thinkmill/graphql-ts/commit/77f8d9eddc27b29bf4922ef6c0f1774881e27dcf) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Resolvers are now allowed to return `undefined` in addition to `null` for fields with nullable output types along with optional properties on a `RootVal` without a resolver being allowed. Resolvers still cannot return `void`(no return) and a property being missing from a `RootVal` without a resolver is still disallowed.

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
