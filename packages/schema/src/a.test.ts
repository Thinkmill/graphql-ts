import { GraphQLSchema, printSchema, validateSchema } from "graphql";
import { graphql, ObjectType } from ".";

const Node = graphql.interface()({
  name: "Node",
  fields: {
    id: graphql.interfaceField({ type: graphql.nonNull(graphql.ID) }),
  },
});

const Connection = graphql.interface()({
  name: "Connection",
  fields: {
    nodes: graphql.interfaceField({
      type: graphql.nonNull(graphql.list(graphql.nonNull(Node))),
    }),
  },
});

const Review = graphql.object<{ id: string; a: string }>()({
  name: "Review",
  interfaces: [Node],
  fields: {
    id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
    a: graphql.field({ type: graphql.nonNull(graphql.String) }),
  },
});

export const ReviewConnection = graphql.object()({
  name: "ReviewConnection",
  interfaces: [Connection],
  fields: {
    nodes: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(Review))),
      resolve: (parent) => {
        return [];
      },
    }),
  },
});

test("a", () => {
  const query = graphql.object()({
    name: "Query",
    fields: {
      reviews: graphql.field({
        type: graphql.nonNull(ReviewConnection),
        resolve: () => {
          return {};
        },
      }),
    },
  });
  const schema = new GraphQLSchema({ query: query.graphQLType });
  validateSchema(schema);
  console.log(printSchema(schema));
});
