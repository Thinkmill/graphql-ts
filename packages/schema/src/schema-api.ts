/**
 * The `schema` export is the primary entrypoint into `@graphql-ts/schema` that
 * lets you compose GraphQL types into a GraphQL Schema
 *
 * A simple schema with only a query type looks like this.
 *
 * ```ts
 * import { schema } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * const Query = schema.object()({
 *   name: "Query",
 *   fields: {
 *     hello: schema.field({
 *       type: schema.String,
 *       resolve() {
 *         return "Hello!";
 *       },
 *     }),
 *   },
 * });
 *
 * const graphQLSchema = new GraphQLSchema({
 *   query: Query.graphQLType,
 * });
 *
 * graphql({
 *   source: `
 *     query {
 *       hello
 *     }
 *   `,
 *   schema: graphQLSchema,
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
 * import { schema } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 * import { deepEqual } from "assert";
 *
 * type TodoItem = {
 *   title: string;
 * };
 *
 * const todos: TodoItem[] = [];
 *
 * const Todo = schema.object<TodoItem>({
 *   name: "Todo",
 *   fields: {
 *     title: schema.field({ type: schema.String }),
 *   },
 * });
 *
 * const Query = schema.object()({
 *   name: "Query",
 *   fields: {
 *     todos: schema.field({
 *       type: schema.list(Todo),
 *       resolve() {
 *         return todos;
 *       },
 *     }),
 *   },
 * });
 *
 * const Mutation = schema.object()({
 *   name: "Mutation",
 *   fields: {
 *     createTodo: schema.field({
 *       args: {
 *         title: schema.arg({ type: schema.String }),
 *       },
 *       type: Todo,
 *       resolve(rootVal, { title }) {
 *         const todo = { title };
 *         todos.push(todo);
 *         return todo;
 *       },
 *     }),
 *   },
 * });
 *
 * const graphQLSchema = new GraphQLSchema({
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
 *     schema: graphQLSchema,
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
 *     schema: graphQLSchema,
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
 *     schema: graphQLSchema,
 *   });
 *   deepEqual(result, {
 *     data: { todos: [{ title: "Try @graphql-ts/schema" }] },
 *   });
 * })();
 * ```
 *
 * For information on how to construct other types like input objects, unions,
 * interfaces and enums and more detailed information, see the documentation in
 * the `schema` export below.
 *
 * When using it, you're going to want to create your own version of it bound to
 * your specific `Context` type.
 *
 * @module
 */
import * as graphqltsSchema from ".";
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
 * The particular `Context` type for this `schema` export that is provided to
 * field resolvers.
 *
 * Below, there are many types exported which are similar to the types with the
 * same names exported from the root of the package except that they are bound
 * to the `Context` type so they can be used elsewhere without needing to be
 * bound to the context on every usage.
 */
export type Context = unknown;

export type NullableType = graphqltsSchema.NullableType<Context>;
export type Type = graphqltsSchema.Type<Context>;
export type NullableOutputType = graphqltsSchema.NullableOutputType<Context>;
export type OutputType = graphqltsSchema.OutputType<Context>;
export type Field<
  RootVal,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType,
  Key extends string
> = graphqltsSchema.Field<RootVal, Args, TType, Key, Context>;
export type FieldResolver<
  RootVal,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType
> = graphqltsSchema.FieldResolver<RootVal, Args, TType, Context>;
export type ObjectType<RootVal> = graphqltsSchema.ObjectType<RootVal, Context>;
export type UnionType<RootVal> = graphqltsSchema.UnionType<RootVal, Context>;
export type InterfaceType<
  RootVal,
  Fields extends Record<
    string,
    graphqltsSchema.InterfaceField<
      Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
      OutputType,
      Context
    >
  >
> = graphqltsSchema.InterfaceType<RootVal, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType
> = graphqltsSchema.InterfaceField<Args, TType, Context>;
