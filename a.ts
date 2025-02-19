import * as g from "./graphql-ts-schema";
type ExpectedArg = {
  input: { [key: string]: g.Arg<g.InputType> };
  object: unknown;
  union: unknown;
  interface: unknown;
  arg: g.InputType;
  nonNull: g.NullableType;
  list: g.Type;
};

type Kind =
  | "input"
  | "object"
  | "union"
  | "arg"
  | "interface"
  | "nonNull"
  | "list";

export { g };

type g<K extends Kind, Val extends ExpectedArg[K]> = K extends "input"
  ? Val extends ExpectedArg["input"]
    ? g.InputObjectType<Val>
    : never
  : K extends "object"
  ? g.ObjectType<Val>
  : K extends "union"
  ? g.UnionType<Val>
  : K extends "arg"
  ? Val extends ExpectedArg["arg"]
    ? g.Arg<Val>
    : never
  : K extends "nonNull"
  ? Val extends ExpectedArg["nonNull"]
    ? g.NonNullType<Val>
    : never
  : K extends "list"
  ? Val extends ExpectedArg["list"]
    ? g.ListType<Val>
    : never
  : never;

export * from "./legacy-alias";
