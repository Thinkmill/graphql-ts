/**
 * The `g` export is the primary entrypoint into `@graphql-ts/schema` that lets
 * you compose GraphQL types into a GraphQL Schema
 *
 * A simple schema with only a query type looks like this.
 *
 * ```ts
 * import { g } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * const Query = g.object()({
 *   name: "Query",
 *   fields: {
 *     hello: g.field({
 *       type: g.String,
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
 * graphql({
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
 * import { g } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 * import { deepEqual } from "assert";
 *
 * type TodoItem = {
 *   title: string;
 * };
 *
 * const todos: TodoItem[] = [];
 *
 * const Todo = g.object<TodoItem>({
 *   name: "Todo",
 *   fields: {
 *     title: g.field({ type: g.String }),
 *   },
 * });
 *
 * const Query = g.object()({
 *   name: "Query",
 *   fields: {
 *     todos: g.field({
 *       type: g.list(Todo),
 *       resolve() {
 *         return todos;
 *       },
 *     }),
 *   },
 * });
 *
 * const Mutation = g.object()({
 *   name: "Mutation",
 *   fields: {
 *     createTodo: g.field({
 *       args: {
 *         title: g.arg({ type: g.String }),
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
 *   const result = await graphql({
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
 *   const result = await graphql({
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
 *   const result = await graphql({
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
 * the `g` export below.
 *
 * When using it, you're going to want to create your own version of it bound to
 * your specific `Context` type.
 *
 * @module
 */
import type * as gInput from "./api-without-context";
import type * as gOutput from "./output";
import type * as gType from "./type";
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

export type NullableType = gType.NullableType<Context>;
export type Type = gType.Type<Context>;
export type NullableOutputType = gOutput.NullableOutputType<Context>;
export type OutputType = gOutput.OutputType<Context>;
export type Field<
  Source,
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType,
  SourceOnField
> = gOutput.Field<Source, Args, TType, SourceOnField, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType
> = gOutput.FieldResolver<Source, Args, TType, Context>;
export type ObjectType<Source> = gOutput.ObjectType<Source, Context>;
export type UnionType<Source> = gOutput.UnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    gOutput.InterfaceField<
      Record<string, gInput.Arg<gInput.InputType>>,
      OutputType,
      Context
    >
  >
> = gOutput.InterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType
> = gOutput.InterfaceField<Args, TType, Context>;
