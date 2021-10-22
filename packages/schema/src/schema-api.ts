/**
 * The `graphql` export is the primary entrypoint into `@graphql-ts/schema` that
 * lets you compose GraphQL types into a GraphQL Schema
 *
 * A simple schema with only a query type looks like this.
 *
 * ```ts
 * import { graphql } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql as runGraphQL } from "graphql";
 *
 * const Query = graphql.object()({
 *   name: "Query",
 *   fields: {
 *     hello: graphql.field({
 *       type: graphql.String,
 *       resolve() {
 *         return "Hello!";
 *       },
 *     }),
 *   },
 * });
 *
 * const schema = new GraphQLSchema({
 *   query: Query.graphQLType,
 * });
 *
 * runGraphQL({
 *   source: `
 *     query {
 *       hello
 *     }
 *   `,
 *   schema,
 * }).then((result) => {
 *   console.log(result);
 * });
 * ```
 *
 * You can use pass the `graphQLSchema` to `ApolloServer` and other GraphQL servers.
 *
 * You can also create a more advanced schema with other object types, args and mutations.
 *
 * ```ts
 * import { graphql } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql as runGraphQL } from "graphql";
 * import { deepEqual } from "assert";
 *
 * type TodoItem = {
 *   title: string;
 * };
 *
 * const todos: TodoItem[] = [];
 *
 * const Todo = graphql.object<TodoItem>({
 *   name: "Todo",
 *   fields: {
 *     title: graphql.field({ type: graphql.String }),
 *   },
 * });
 *
 * const Query = graphql.object()({
 *   name: "Query",
 *   fields: {
 *     todos: graphql.field({
 *       type: graphql.list(Todo),
 *       resolve() {
 *         return todos;
 *       },
 *     }),
 *   },
 * });
 *
 * const Mutation = graphql.object()({
 *   name: "Mutation",
 *   fields: {
 *     createTodo: graphql.field({
 *       args: {
 *         title: graphql.arg({ type: graphql.String }),
 *       },
 *       type: Todo,
 *       resolve(source, { title }) {
 *         const todo = { title };
 *         todos.push(todo);
 *         return todo;
 *       },
 *     }),
 *   },
 * });
 *
 * const schema = new GraphQLSchema({
 *   query: Query.graphQLType,
 *   mutation: Mutation.graphQLType,
 * });
 *
 * (async () => {
 *   const result = await runGraphQL({
 *     source: `
 *       query {
 *         todos {
 *           title
 *         }
 *       }
 *     `,
 *     schema,
 *   });
 *   deepEqual(result, { data: { todos: [] } });
 *
 *   const result = await runGraphQL({
 *     source: `
 *       mutation {
 *         createTodo(title: "Try @graphql-ts/schema") {
 *           title
 *         }
 *       }
 *     `,
 *     schema,
 *   });
 *   deepEqual(result, {
 *     data: { createTodo: { title: "Try @graphql-ts/schema" } },
 *   });
 *
 *   const result = await runGraphQL({
 *     source: `
 *       query {
 *         todos {
 *           title
 *         }
 *       }
 *     `,
 *     schema,
 *   });
 *   deepEqual(result, {
 *     data: { todos: [{ title: "Try @graphql-ts/schema" }] },
 *   });
 * })();
 * ```
 *
 * For information on how to construct other types like input objects, unions,
 * interfaces and enums and more detailed information, see the documentation in
 * the `graphql` export below.
 *
 * When using it, you're going to want to create your own version of it bound to
 * your specific `Context` type.
 *
 * @module
 */
import * as graphql from ".";
export { field, object } from "./api-with-context";
export {
  arg,
  Boolean,
  Float,
  ID,
  Int,
  String,
  inputObject,
  list,
  nonNull,
  enum,
  enumValues,
} from "./api-without-context";
export { fields, interface, interfaceField, union } from "./api-with-context";
export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  InferValueFromOutputType,
  InputObjectType,
  InputType,
  ListType,
  NonNullType,
  NullableInputType,
  ScalarType,
  EnumType,
  EnumValue,
  Arg,
} from "./api-without-context";
export { scalar } from "./api-without-context";

/**
 * The particular `Context` type for this `graphql` export that is provided to
 * field resolvers.
 *
 * Below, there are many types exported which are similar to the types with the
 * same names exported from the root of the package except that they are bound
 * to the `Context` type so they can be used elsewhere without needing to be
 * bound to the context on every usage.
 */
export type Context = unknown;

export type NullableType = graphql.NullableType<Context>;
export type Type = graphql.Type<Context>;
export type NullableOutputType = graphql.NullableOutputType<Context>;
export type OutputType = graphql.OutputType<Context>;
export type Field<
  Source,
  Args extends Record<string, graphql.Arg<graphql.InputType>>,
  TType extends OutputType,
  Key extends string
> = graphql.Field<Source, Args, TType, Key, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, graphql.Arg<graphql.InputType>>,
  TType extends OutputType
> = graphql.FieldResolver<Source, Args, TType, Context>;
export type ObjectType<Source> = graphql.ObjectType<Source, Context>;
export type UnionType<Source> = graphql.UnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    graphql.InterfaceField<
      Record<string, graphql.Arg<graphql.InputType>>,
      OutputType,
      Context
    >
  >
> = graphql.InterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphql.Arg<graphql.InputType>>,
  TType extends OutputType
> = graphql.InterfaceField<Args, TType, Context>;
