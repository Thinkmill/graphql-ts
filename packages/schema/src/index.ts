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
 *   loadPerson: (id: string) => Person;
 *   loadFriends: (id: string) => Person[];
 * };
 * const g = initG<Context>();
 * type g<T> = initG<T>;
 *
 * type Person = {
 *   id: string;
 *   name: string;
 * };
 *
 * const Person: g<typeof g.object<Person>> = g.object<Person>()({
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
 *       query {
 *         person(id: "1") {
 *           id
 *           name
 *           friends {
 *             id
 *             name
 *           }
 *         }
 *       }
 *     `,
 *   schema,
 *   context: {
 *     loadPerson: (id) => people.get(id),
 *     loadFriends: (id) => {
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
import { initG, type GWithContext } from "./output";
export { initG };
export type { GWithContext };

export {
  GObjectType,
  GEnumType,
  GScalarType,
  GInputObjectType,
  GInterfaceType,
  GUnionType,
  GList,
  GNonNull,
  type GArg,
  type GField,
  type GFieldResolver,
  type GInterfaceField,
  type GNullableInputType,
  type GNullableOutputType,
  type GNullableType,
  type GInputType,
  type GOutputType,
  type GType,
  type InferValueFromOutputType,
  type InferValueFromArg,
  type InferValueFromArgs,
  type InferValueFromInputType,
} from "./types";
export { g } from "./schema-api";

export type {
  Arg,
  EnumType,
  InputObjectType,
  InputType,
  NullableInputType,
  ListType,
  NonNullType,
  ScalarType,
} from "./api-without-context";

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

/** @deprecated Use {@link GField} instead */
export type Field<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  SourceAtKey,
  Context,
> = GField<Source, Args, Type, SourceAtKey, Context>;
/** @deprecated Use {@link GFieldResolver} instead */
export type FieldResolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GFieldResolver<Source, Args, Type, Context>;

/** @deprecated Use {@link GInterfaceField} instead */
export type InterfaceField<
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GInterfaceField<Args, Type, Context>;
/** @deprecated Use {@link GInterfaceType} instead */
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Context,
> = GInterfaceType<Source, Fields, Context>;
/** @deprecated Use {@link GNullableOutputType} instead */
export type NullableOutputType<Context> = GNullableOutputType<Context>;
/** @deprecated Use {@link GObjectType} instead */
export type ObjectType<Source, Context> = GObjectType<Source, Context>;
/** @deprecated Use {@link GOutputType} instead */
export type OutputType<Context> = GOutputType<Context>;
/** @deprecated Use {@link GUnionType} instead */
export type UnionType<Source, Context> = GUnionType<Source, Context>;
/** @deprecated Use {@link GType} instead */
export type Type<Context> = GType<Context>;
/** @deprecated Use {@link GNullableType} instead */
export type NullableType<Context> = GNullableType<Context>;

export * from "./schema-api-alias";
