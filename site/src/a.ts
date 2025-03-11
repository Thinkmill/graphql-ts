import { gWithContext } from "@graphql-ts/schema";

const g = gWithContext();

const Node = g.interface<{
  __typename: string;
}>()({
  name: "Node",
  fields: {
    id: g.field({ type: g.ID }),
  },
});

const User = g.object<{
  __typename: string;
  id: string;
  a: string;
}>()({
  name: "User",
  interfaces: [Node],
  fields: {
    id: g.field({ type: g.ID }),
  },
});
