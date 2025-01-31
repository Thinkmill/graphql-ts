/**
 * The `graphql` export has been renamed to `g`.
 *
 * To quickly update usages of `graphql` in your project to `g`:
 *
 * 1. Use your editor's "Go to Definition" to go navigate to where this deprecated
 *    alias is defined
 * 2. Use "Rename Symbol" to rename `graphql` to `g`, this will update usages of
 *    `graphql` to `g`
 * 3. Change this deprecated alias back from `g` to `graphql` using normal text
 *    editing to preserve the updates you made in step 2
 *
 * You can similarly use "Rename Symbol" to quickly rename your own custom
 * defined `graphql` to `g` if you wish.
 *
 * @deprecated
 */
export import graphql = require("./schema-api");
