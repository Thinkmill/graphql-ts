/**
 * `@graphql-ts/schema` is a thin wrapper around
 * [GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
 * constructing GraphQL Schemas while avoiding type-generation, [declaration
 * merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * and
 * [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).
 *
 * ```ts
 * import { gWithContext } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * type Context = {
 *   loadPerson: (id: string) => Person | undefined;
 *   loadFriends: (id: string) => Person[];
 * };
 * const g = gWithContext<Context>();
 * type g<T> = gWithContext.infer<T>;
 *
 * type Person = {
 *   id: string;
 *   name: string;
 * };
 *
 * const Person: g<typeof g.object<Person>> = g.object<Person>()({
 *   name: "Person",
 *   fields: () => ({
 *     id: g.field({ type: g.nonNull(g.ID) }),
 *     name: g.field({ type: g.nonNull(g.String) }),
 *     friends: g.field({
 *       type: g.list(g.nonNull(Person)),
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
 *         id: g.arg({ type: g.nonNull(g.ID) }),
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
 * {
 *   const people = new Map<string, Person>([
 *     ["1", { id: "1", name: "Alice" }],
 *     ["2", { id: "2", name: "Bob" }],
 *   ]);
 *   const friends = new Map<string, string[]>([
 *     ["1", ["2"]],
 *     ["2", ["1"]],
 *   ]);
 *   const contextValue: Context = {
 *     loadPerson: (id) => people.get(id),
 *     loadFriends: (id) => {
 *       return (friends.get(id) ?? [])
 *         .map((id) => people.get(id))
 *         .filter((person) => person !== undefined) as Person[];
 *     },
 *   };
 *   graphql({
 *     source: `
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
 *     schema,
 *     contextValue,
 *   }).then((result) => {
 *     console.log(result);
 *   });
 * }
 * ```
 *
 * @module
 */
import { gWithContext, type GWithContext } from "./output";
export { gWithContext };
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
