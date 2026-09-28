import { gWithContext } from "@graphql-ts/schema";
import type { GraphQLInterfaceType } from "graphql";

const g = gWithContext<unknown>();
const node = g.interface<{ id: string }>()({
  name: "Node",
  fields: {
    lookup: g.interfaceField({
      type: g.String,
      args: { id: g.arg({ type: g.nonNull(g.ID) }) },
    }),
    label: g.interfaceField({ type: g.String, args: {} }),
  },
});

const config = node.toConfig();
config.fields.lookup.args.id.type;
// @ts-expect-error only declared argument names may be accessed
config.fields.lookup.args.typo.type;
// @ts-expect-error fields without arguments have no argument names
config.fields.label.args.typo;

type Invariant<T> = (value: T) => T;
function assertCompatible<Expected, _Actual extends Expected>() {}

assertCompatible<
  Invariant<"id">,
  Invariant<keyof typeof config.fields.lookup.args>
>();
assertCompatible<
  Invariant<never>,
  Invariant<keyof typeof config.fields.label.args>
>();
assertCompatible<ReturnType<GraphQLInterfaceType["toConfig"]>, typeof config>();
