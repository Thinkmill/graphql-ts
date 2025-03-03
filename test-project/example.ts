import { initG } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";

type Context = {
  loadPerson: (id: string) => Person | undefined;
  loadFriends: (id: string) => Person[];
};
const g = initG<Context>();
type g<
  Key extends initG.Key,
  Arg extends initG.Arg[Key] = initG.ArgDefaults[Key],
  OtherArg extends initG.OtherArg[Key] = initG.OtherArgDefaults<Arg>[Key],
> = initG<Context, Key, Arg, OtherArg>;

type Person = {
  id: string;
  name: string;
};

const Person: g<"object", Person> = g.object<Person>()({
  name: "Person",
  fields: () => ({
    id: g.field({ type: g.nonNull(g.ID) }),
    name: g.field({ type: g.nonNull(g.String) }),
    friends: g.field({
      type: g.list(g.nonNull(Person)),
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
        id: g.arg({ type: g.nonNull(g.ID) }),
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

{
  const people = new Map<string, Person>([
    ["1", { id: "1", name: "Alice" }],
    ["2", { id: "2", name: "Bob" }],
  ]);
  const friends = new Map<string, string[]>([
    ["1", ["2"]],
    ["2", ["1"]],
  ]);
  const contextValue: Context = {
    loadPerson: (id) => people.get(id),
    loadFriends: (id) => {
      return (friends.get(id) ?? [])
        .map((id) => people.get(id))
        .filter((person) => person !== undefined) as Person[];
    },
  };
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
    contextValue,
  }).then((result) => {
    console.log(result);
  });
}
