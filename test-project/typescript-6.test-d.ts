import { gWithContext } from "@graphql-ts/schema";

const g = gWithContext<unknown>();

g.object()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
      // @ts-expect-error
      resolve() {},
    }),
  },
});

{
  const a = {
    something: g.field({
      type: g.String,
      args: {
        a: g.arg({ type: g.nonNull(g.String) }),
      },
      resolve() {
        return "something";
      },
    }),
    other: g.field({
      type: g.String,
      args: {
        b: g.arg({ type: g.nonNull(g.String) }),
      },
      // @ts-expect-error
      resolve() {},
    }),
  };
  g.object()({
    name: "Thing",
    fields: {
      ...a,
    },
  });
}
