---
"@graphql-ts/schema": patch
---

Resolvers are now allowed to return `undefined` in addition to `null` nullable output types along with optional properties on a `RootVal` being allowed. Resolvers still cannot return `void`(no return) and a property being missing from a `RootVal` without a resolver is still disallowed.
