/**
 * `@graphql-ts/schema` is a thin wrapper around
 * [GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
 * constructing GraphQL Schemas while avoiding type-generation, [declaration
 * merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * and
 * [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).
 *
 * ```ts
 * import { initG } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * type Context = {
 *   loadPerson: (id: string) => Promise<Person>;
 *   loadFriends: (id: string) => Promise<Person[]>;
 * };
 * const g = initG<Context>();
 * type g<
 *   Key extends initG.Key,
 *   Arg extends initG.Arg[Key] = initG.ArgDefaults[Key],
 *   OtherArg extends
 *     initG.OtherArg[Key] = initG.OtherArgDefaults<Arg>[Key],
 * > = initG<Context, Key, Arg, OtherArg>;
 *
 * type Person = {
 *   id: string;
 *   name: string;
 * };
 *
 * const Person: g<"object", Person> = g.object<Person>()({
 *   name: "Person",
 *   fields: () => ({
 *     id: g.field({ type: g.ID }),
 *     name: g.field({ type: g.String }),
 *     friends: g.field({
 *       type: g.list(Person),
 *       resolve(source, _, context) {
 *         return context.loadFriends(source.id);
 *       },
 *     }),
 *   }),
 * });
 *
 * const Query = g.object()({
 *   name: "Query",
 *   fields: {
 *     person: g.field({
 *       type: Person,
 *       args: {
 *         id: g.arg({ type: g.ID }),
 *       },
 *       resolve(_, args, context) {
 *         return context.loadPerson(args.id);
 *       },
 *     }),
 *   },
 * });
 *
 * const schema = new GraphQLSchema({
 *   query: Query,
 * });
 *
 * const people = new Map<string, Person>([
 *   ["1", { id: "1", name: "Alice" }],
 *   ["2", { id: "2", name: "Bob" }],
 * ]);
 * const friends = new Map<string, string[]>([
 *   ["1", ["2"]],
 *   ["2", ["1"]],
 * ]);
 *
 * graphql({
 *   source: `
 *     query {
 *       person(id: "1") {
 *         id
 *         name
 *         friends {
 *           id
 *           name
 *         }
 *       }
 *     }
 *   `,
 *   schema,
 *   context: {
 *     loadPerson: async (id) => people.get(id),
 *     loadFriends: async (id) => {
 *       return (friends.get(id) ?? [])
 *         .map((id) => people.get(id))
 *         .filter((person) => person !== undefined);
 *     },
 *   },
 * }).then((result) => {
 *   console.log(result);
 * });
 * ```
 *
 * @module
 */
export * as g from "./schema-api";
export type g<
  Key extends initG.Key,
  FirstArg extends initG.Arg[Key] = initG.ArgDefaults[Key],
  SecondArg extends initG.OtherArg[Key] = initG.OtherArgDefaults<FirstArg>[Key],
> = initG<unknown, Key, FirstArg, SecondArg>;
export { initG, type GWithContext } from "./output";

export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  Arg,
  EnumType,
  InputObjectType,
  InputType,
  NullableInputType,
  ListType,
  NonNullType,
  ScalarType,
} from "./api-without-context";

export type Field<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  SourceAtKey,
  Context,
> = GField<Source, Args, Type, SourceAtKey, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GFieldResolver<Source, Args, Type, Context>;
export type { InferValueFromOutputType } from "./output";

export type InterfaceField<
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GInterfaceField<Args, Type, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Context,
> = GInterfaceType<Source, Fields, Context>;
export type NullableOutputType<Context> = GNullableOutputType<Context>;
export type ObjectType<Source, Context> = GObjectType<Source, Context>;
export type OutputType<Context> = GOutputType<Context>;
export type UnionType<Source, Context> = GUnionType<Source, Context>;
export type Type<Context> = GType<Context>;
export type NullableType<Context> = GNullableType<Context>;

export * from "./schema-api-alias";

import { initG } from "./output";
import type {
  GArg,
  GField,
  GFieldResolver,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GNullableOutputType,
  GNullableType,
  GObjectType,
  GOutputType,
  GType,
  GUnionType,
} from "./types";
