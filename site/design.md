---
title: Design
---

# Design

`@graphql-ts/schema` is intentionally designed to be a small library that just adds type-safety to the APIs in GraphQL.js used to construct a GraphQL schema. There a few patterns sometimes used in solutions for that `@graphql-ts/schema` avoids:

- type-generation
  - This is because type-generation removes the ability to express types for part of a schema which is vital for one of the original use-cases of `@graphql-ts/schema` which was in [KeystoneJS](https://keystonejs.com) where it constructs a GraphQL schema.
- [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
  - Similar to type-generation, depending on the way declaration merging is used, it can remove the ability to express types for part of a schema
  - Declaration merging is also global so co-locating different GraphQL schemas in the same TypeScript compilation can cause conflicts
- [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
  - While decorators

The core idea of `@graphql-ts/schema` is that the API in GraphQL.js allows is already quite good and doesn't need endless syntax sugar to make write (though `@graphql-ts/schema` does add some small pieces of syntax sugar along)

One of the best ways to illustrate how minimal `@graphql-ts/schema` is, is to show the entirety of `@graphql-ts/schema` with the types and comments removed:

```ts
import {
  GraphQLScalarType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} from "graphql";
export {
  GraphQLEnumType as GEnumType,
  GraphQLInputObjectType as GInputObjectType,
  GraphQLInterfaceType as GInterfaceType,
  GraphQLList as GList,
  GraphQLNonNull as GNonNull,
  GraphQLObjectType as GObjectType,
  GraphQLScalarType as GScalarType,
  GraphQLUnionType as GUnionType,
} from "graphql";

function gWithContext() {
  return {
    scalar(config) {
      return new GraphQLScalarType(config);
    },
    list(of) {
      return new GraphQLList(of);
    },
    nonNull(of) {
      return new GraphQLNonNull(of);
    },
    inputObject(config) {
      return new GraphQLInputObjectType(config);
    },
    enum(config) {
      return new GraphQLEnumType(config);
    },
    union(config) {
      return new GraphQLUnionType(config);
    },
    object() {
      return function objectInner(config) {
        return new GraphQLObjectType(config);
      };
    },
    interface() {
      return function interfaceInner(config) {
        return new GraphQLInterfaceType(config);
      };
    },
    fields() {
      return function fieldsInner(fields) {
        return fields;
      };
    },
    field(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.field()");
      }
      return field;
    },
    interfaceField(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.interfaceField()");
      }
      return field;
    },
    arg(arg) {
      if (!arg.type) {
        throw new Error("A type must be passed to g.arg()");
      }
      return arg;
    },
    enumValues(values) {
      return Object.fromEntries(values.map((value) => [value, { value }]));
    },
    Int: GraphQLInt,
    Float: GraphQLFloat,
    String: GraphQLString,
    Boolean: GraphQLBoolean,
    ID: GraphQLID,
  };
}

export { gWithContext };
```

That is ~90 lines of code that fundamentally just pass arguments to the GraphQL.js API.

`@graphql-ts/schema` was originally designed for [KeystoneJS](https://keystonejs.com) to solve some requirements it had:

- Type-safety when constructing a GraphQL schema
- The ability to express the types for part of a schema since KeystoneJS builds a GraphQL schema dynamically from.
