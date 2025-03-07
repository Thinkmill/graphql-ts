# @graphql-ts/schema

`@graphql-ts/schema` is a thin wrapper around
[GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
constructing GraphQL Schemas while avoiding type-generation, [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
and [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).

```ts
import { initG } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

type Context = {
  loadPerson: (id: string) => Person;
  loadFriends: (id: string) => Person[];
};
const g = initG<Context>();
type g<T> = initG<T>;

type Person = {
  id: string;
  name: string;
};

const Person: g<typeof g.object<Person>> = g.object<Person>()({
  name: "Person",
  fields: () => ({
    id: g.field({ type: g.ID }),
    name: g.field({ type: g.String }),
    friends: g.field({
      type: g.list(Person),
      resolve(source, _, context) {
        return context.loadFriends(source.id);
      },
    }),
  }),
});

const Query = g.object()({
  name: "Query",
  fields: {
    person: g.field({
      type: Person,
      args: {
        id: g.arg({ type: g.ID }),
      },
      resolve(_, args, context) {
        return context.loadPerson(args.id);
      },
    }),
  },
});

const schema = new GraphQLSchema({
  query: Query,
});

const people = new Map<string, Person>([
  ["1", { id: "1", name: "Alice" }],
  ["2", { id: "2", name: "Bob" }],
]);
const friends = new Map<string, string[]>([
  ["1", ["2"]],
  ["2", ["1"]],
]);

graphql({
  source: `
      query {
        person(id: "1") {
          id
          name
          friends {
            id
            name
          }
        }
      }
    `,
  schema,
  context: {
    loadPerson: (id) => people.get(id),
    loadFriends: (id) => {
      return (friends.get(id) ?? [])
        .map((id) => people.get(id))
        .filter((person) => person !== undefined);
    },
  },
}).then((result) => {
  console.log(result);
});
```
