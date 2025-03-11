# Schema Extension

graphql-ts provides a small library, `@graphql-ts/extend`, to extend a GraphQL schema with new query/mutation fields and types. This shouldn't be used when creating a schema entirely with graphql-ts but if you have an existing GraphQL.js-compatible schema, you can use this library to extend it with graphql-ts types.

## Installation

```bash
npm install @graphql-ts/extend
```

## Usage

```ts twoslash
// @noErrors
// @filename: g.ts
import { gWithContext } from "@graphql-ts/schema";

export type Context = {};

export const g = gWithContext();
export type g<T> = gWithContext.infer<T>;
// @filename: existing-schema.ts
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from "graphql";
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => "world",
      },
    },
  }),
});
// @filename: index.ts
// ---cut---
import { extend } from "@graphql-ts/extend";
import { schema } from "./existing-schema";
import { g } from "./g";

const newSchema = extend((base) => {
  const existingType = base.
  //                        ^|
  return {
    query: {
      hello: g.field({
        type: g.String,
        resolve: () => "world",
      }),
      users: g.field({
// @annotate: `base` allows easily retrieving types from the existing schema
        type: g.list(base.object("User")),
                  // ^^^^
        resolve: () => {
          return [];
        },
      }),
    },
  };
})(schema);
```

## Limitations

`extend` only supports extending the query and mutation types. `extend` also doesn't support schemas that use the query or mutation types in any types besides as the root query/mutation types.

Also, since there is no type-information in the existing schema, all existing types that can be used are typed generically e.g. for object types, the source type is `unknown` and etc.
