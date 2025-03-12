/// <reference types="node" />
import { gWithContext } from "@graphql-ts/schema";
import { GraphQLSchema, graphql } from "graphql";
import { deepEqual } from "node:assert";

type Context = {
  todos: Map<string, TodoItem>;
};

const g = gWithContext<Context>();
type g<T> = gWithContext.infer<T>;

type TodoItem = {
  id: string;
  title: string;
  relatedTodos: string[];
};

const Todo: g<typeof g.object<TodoItem>> = g.object<TodoItem>()({
  name: "Todo",
  fields: () => ({
    id: g.field({ type: g.nonNull(g.ID) }),
    title: g.field({ type: g.nonNull(g.String) }),
    relatedTodos: g.field({
      type: g.list(Todo),
      resolve(source, _args, context) {
        return source.relatedTodos
          .map((id) => context.todos.get(id))
          .filter((todo) => todo !== undefined);
      },
    }),
  }),
});

const Query = g.object()({
  name: "Query",
  fields: {
    todos: g.field({
      type: g.list(Todo),
      resolve(_source, _args, context) {
        return context.todos.values();
      },
    }),
  },
});

const Mutation = g.object()({
  name: "Mutation",
  fields: {
    createTodo: g.field({
      args: {
        title: g.arg({ type: g.nonNull(g.String) }),
        relatedTodos: g.arg({
          type: g.nonNull(g.list(g.nonNull(g.ID))),
          defaultValue: [],
        }),
      },
      type: Todo,
      resolve(_source, { title, relatedTodos }, context) {
        const todo = { title, relatedTodos, id: crypto.randomUUID() };
        context.todos.set(todo.id, todo);
        return todo;
      },
    }),
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

(async () => {
  const contextValue: Context = { todos: new Map() };
  {
    const result = await graphql({
      source: `
        query {
          todos {
            title
          }
        }
      `,
      schema,
      contextValue,
    });
    deepEqual(result, { data: { todos: [] } });
  }

  {
    const result = await graphql({
      source: `
        mutation {
          createTodo(title: "Try graphql-ts") {
            title
          }
        }
      `,
      schema,
      contextValue,
    });
    deepEqual(result, {
      data: { createTodo: { title: "Try graphql-ts" } },
    });
  }
  {
    const result = await graphql({
      source: `
        query {
          todos {
            title
          }
        }
      `,
      schema,
      contextValue,
    });
    deepEqual(result, {
      data: { todos: [{ title: "Try graphql-ts" }] },
    });
  }
})();
