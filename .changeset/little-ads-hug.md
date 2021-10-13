---
"@graphql-ts/schema": patch
---

Updated the definition of `graphql.union` so that the `Context` of the `UnionType` returned and the `Context` passed to `resolveType` are determined by the `Context` of the `graphql` object rather than a union of the `Context`s of the union's member types.
