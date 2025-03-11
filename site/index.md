---
layout: home

title: graphql-ts

hero:
  name: graphql-ts
  tagline: Simple Type-Safe GraphQL Schemas in TypeScript
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: What is graphql-ts?
      link: /introduction

features:
  - icon: 🛡
    title: Type Safety
    details:
  - icon: 🪶
    title: Minimal API
    details: There's not much to learn, just a few functions that mirror the GraphQL.js API.
  - icon: 🧩
    title: Direct Compatibility with GraphQL.js
    details: Use with any existing other GraphQL that uses GraphQL.js, like Apollo Server, GraphQL Yoga, etc.
---

<!-- prettier-ignore -->
```ts twoslash
// @noErrors
import { gWithContext } from "@graphql-ts/schema";
import { GraphQLSchema } from "graphql";
type Context = {
  loadUser: (id: string) => Promise<User | null>;
  loadFriends: (id: string) => Promise<User[]>;
}
const g = gWithContext<Context>();
type g<T> = gWithContext.infer<T>;
// ---cut---
type User = { id: string; name: string };
const User: g<typeof g.object<User>> = g.object<User>()({
  name: "User",
  fields: () => ({
    id: g.field({ type: g.nonNull(g.ID) }),
    name: g.field({ type: g.nonNull(g.String) }),
    friends: g.field({
      type: g.String,
      resolve(source, args, context) {
        return context.loadFriends(source.);
        //                                ^|
      },
    }),
  }),
});

const Query = g.object()({
  name: "Query",
  fields: {
    user: g.field({
      type: User,
      args: {
        id: g.arg({ type: g.nonNull(g.ID) }),
      },
      resolve(_, args, context) {
        return context.loadUser(args.);
        //                           ^|
      },
    }),
  },
});

const schema = new GraphQLSchema({ query: Query });
```
