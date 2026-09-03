import { gWithContext } from "@graphql-ts/schema";

const g = gWithContext<unknown>();

g.object()({
  name: "Thing",
  fields: {
    // this error doesn't happen on ts@6 (good)
    // @ts-expect-error
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
    // this error doesn't happen on ts@6 (good)
    // @ts-expect-error
    fields: {
      ...a,
    },
  });
}
