import {
  Arg,
  g,
  InputObjectType,
  InterfaceField,
  InterfaceType,
  ListType,
  NonNullType,
  ObjectType,
  UnionType,
} from "./index";
export type ReplaceFields<A, B> = {
  [K in keyof A]: K extends keyof B ? B[K] : A[K];
} & {};

type Kind =
  | "inputObject"
  | "object"
  | "union"
  | "arg"
  | "interface"
  | "nonNull"
  | "list";

type ExpectedArg = {
  inputObject: { [key: string]: g.Arg<g.InputType> };
  object: unknown;
  union: unknown;
  interface: unknown;
  arg: g.InputType;
  nonNull: g.NullableType;
  list: g.Type;
};

type ExpectedSecondArg = {
  inputObject: boolean;
  object: never;
  union: never;
  interface: { [key: string]: InterfaceField<any, any, any> };
  arg: boolean;
  nonNull: never;
  list: never;
};

export type bindGToContext<
  Context,
  K extends Kind,
  FirstArg extends ExpectedArg[K] = ExpectedArg[K],
  SecondArg extends ExpectedSecondArg[K] = ExpectedSecondArg[K]
> = K extends "input"
  ? InputObjectType<FirstArg>
  : K extends "object"
  ? ObjectType<FirstArg, Context>
  : K extends "interface"
  ? SecondArg extends ExpectedSecondArg["interface"]
    ? InterfaceType<FirstArg, SecondArg, Context>
    : never
  : K extends "union"
  ? UnionType<FirstArg, Context>
  : K extends "arg"
  ? FirstArg extends ExpectedArg["arg"]
    ? SecondArg extends ExpectedSecondArg["arg"]
      ? Arg<FirstArg, SecondArg>
      : never
    : never
  : K extends "nonNull"
  ? FirstArg extends ExpectedArg["nonNull"]
    ? NonNullType<FirstArg>
    : never
  : K extends "list"
  ? FirstArg extends ExpectedArg["list"]
    ? ListType<FirstArg>
    : never
  : never;

type MyContext = { todos: () => string[] };

type g<
  K extends Kind,
  FirstArg extends ExpectedArg[K] = ExpectedArg[K],
  SecondArg extends ExpectedSecondArg[K] = ExpectedSecondArg[K]
> = bindGToContext<any, K, FirstArg, SecondArg>;

type IntFilterType = g<
  "inputObject",
  {
    equals: g<"arg", typeof g.Int>;
    in: g<"arg", g<"list", g<"nonNull", typeof g.Int>>>;
    notIn: g<"arg", g<"list", g<"nonNull", typeof g.Int>>>;
    lt: g<"arg", typeof g.Int>;
    lte: g<"arg", typeof g.Int>;
    gt: g<"arg", typeof g.Int>;
    gte: g<"arg", typeof g.Int>;
    not: g<"arg", IntFilterType>;
  }
>;

type MyThing = { something: boolean };

const Something: g<"object", MyThing> = g.object<MyThing>()({
  name: "Something",
  fields: () => ({
    something: g.field({ type: g.nonNull(g.Boolean) }),
    other: g.field({
      type: g.nonNull(Something),
      resolve: () => ({ something: true }),
    }),
  }),
});
