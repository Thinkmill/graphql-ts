import * as _g from "./schema-api";

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
 */
export import g = _g;
