# @graphql-ts/extend

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
