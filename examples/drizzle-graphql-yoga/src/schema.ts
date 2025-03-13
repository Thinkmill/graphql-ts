import { GraphQLSchema } from "graphql";
import { g } from "./g.js";
import * as dbSchema from "./db-schema.js";
import { eq } from "drizzle-orm";

const Todo = g.object<typeof dbSchema.todo.$inferSelect>()({
  name: "Todo",
  fields: {
    id: g.field({ type: g.nonNull(g.ID) }),
    title: g.field({ type: g.nonNull(g.String) }),
    done: g.field({ type: g.nonNull(g.Boolean) }),
  },
});

const Query = g.object()({
  name: "Query",
  fields: {
    todos: g.field({
      type: g.list(g.nonNull(Todo)),
      resolve(_root, _args, ctx) {
        return ctx.db.query.todo.findMany();
      },
    }),
    todo: g.field({
      type: Todo,
      args: {
        id: g.arg({ type: g.nonNull(g.ID) }),
      },
      resolve(_root, args, ctx) {
        return ctx.db.query.todo.findFirst({
          where: eq(dbSchema.todo.id, args.id),
        });
      },
    }),
  },
});

const Mutation = g.object()({
  name: "Mutation",
  fields: {
    createTodo: g.field({
      type: Todo,
      args: {
        title: g.arg({ type: g.nonNull(g.String) }),
      },
      async resolve(_root, args, ctx) {
        const inserted = await ctx.db
          .insert(dbSchema.todo)
          .values({ title: args.title })
          .returning();
        return inserted[0];
      },
    }),
    updateTodo: g.field({
      type: Todo,
      args: {
        id: g.arg({ type: g.nonNull(g.ID) }),
        title: g.arg({ type: g.String }),
        done: g.arg({ type: g.Boolean }),
      },
      async resolve(_root, args, ctx) {
        const updated = await ctx.db
          .update(dbSchema.todo)
          .set({
            title: args.title ?? undefined,
            done: args.done ?? undefined,
          })
          .where(eq(dbSchema.todo.id, args.id))
          .returning();
        return updated[0];
      },
    }),
    deleteTodo: g.field({
      type: Todo,
      args: {
        id: g.arg({ type: g.nonNull(g.ID) }),
      },
      async resolve(_root, args, ctx) {
        const deleted = await ctx.db
          .delete(dbSchema.todo)
          .where(eq(dbSchema.todo.id, args.id))
          .returning();
        return deleted[0];
      },
    }),
  },
});

export const schema = new GraphQLSchema({ query: Query, mutation: Mutation });
