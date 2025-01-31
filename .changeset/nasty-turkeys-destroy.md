---
"@graphql-ts/schema": patch
---

The `graphql` export has been renamed to `g` to make reading/writing schemas more concise and to avoid conflicts with exports named `graphql` from libraries such as Relay, GraphQL Code Generator and gql.tada that use the variable name `graphql` to declare GraphQL operations.

The `graphql` export still exists but is now deprecated and may be removed in a future release.

To quickly update usages of the `graphql` export in your project to use `g`:

1. Navigate to `node_modules/@graphql-ts/schema/dist/declarations/src/schema-api-alias.d.ts` in your editor ("Go to Definition" will not take you to the correct file)
2. Use "Rename Symbol" to rename `graphql` to `g`, this will update usages of `graphql` to `g`
3. Change this deprecated alias back from `g` to `graphql` (avoid using "Rename Symbol" again because you want to preserve the updates you made in step 2)

You can similarly use "Rename Symbol" to quickly rename your own custom defined `graphql` to `g`.
