# @graphql-ts/extend

## 0.4.0

### Minor Changes

- [`5d1c299`](https://github.com/Thinkmill/graphql-ts/commit/5d1c299ae50a8bafea8e409f9c2c1e5abedaa29a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Type parameters named `RootVal` have been renamed to `Source` and properties named `__rootVal` have been renamed to `__source`. This won't require code changes unless you've relied on the `__rootVal` properties(which you shouldn't).

* [`232cec8`](https://github.com/Thinkmill/graphql-ts/commit/232cec81c04c3489c053e24cfe37ab7f3d8a4265) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `BaseSchemaInfo` has been renamed to `BaseSchemaMeta`

## 0.3.0

### Minor Changes

- [`c92bf61`](https://github.com/Thinkmill/graphql-ts/commit/c92bf61044af69d72003a076b2a191ff685633fb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - An array of extensions can now be passed to `extend`

## 0.2.0

### Minor Changes

- [`42f4abe`](https://github.com/Thinkmill/graphql-ts/commit/42f4abe6ad5e6b1bfec3eb7acfad0e54721c63cb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `wrap` export to wrap graphql-js types into @graphql-ts/schema types and expand the functions on `BaseSchemaInfo` to all GraphQL types

## 0.1.0

### Minor Changes

- [`3b6d533`](https://github.com/Thinkmill/graphql-ts/commit/3b6d533f9e76c54341610346e1e7bcab29f6826b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release. This package is very early and will have many breaking changes.
