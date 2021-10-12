import { GraphQLSchema, graphqlSync, printSchema } from "graphql";
import { graphql } from "@graphql-ts/schema";
import { extend } from ".";

const getGql =
  (schema: GraphQLSchema) =>
  ([source]: TemplateStringsArray) =>
    graphqlSync({ schema, source });

expect.addSnapshotSerializer({
  test(arg) {
    return arg instanceof GraphQLSchema;
  },
  serialize(val: GraphQLSchema) {
    return printSchema(val).trim();
  },
});

const onlyQuery = new GraphQLSchema({
  query: graphql.object()({
    name: "Query",
    fields: {
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
    },
  }).graphQLType,
});

test("basic query", () => {
  const extended = extend({
    query: {
      hello: graphql.field({
        type: graphql.String,
        resolve() {
          return "Hello!";
        },
      }),
    },
  })(onlyQuery);
  expect(extended).toMatchInlineSnapshot(`
type Query {
  thing: String
  hello: String
}
`);
  const gql = getGql(extended);
  expect(gql`
    query {
      hello
      thing
    }
  `).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "hello": "Hello!",
    "thing": "Thing",
  },
}
`);
});

test("basic mutation with no existing mutations", () => {
  const extended = extend({
    mutation: {
      something: graphql.field({
        type: graphql.String,
        resolve() {
          return "";
        },
      }),
    },
  })(onlyQuery);
  expect(extended).toMatchInlineSnapshot(`
type Mutation {
  something: String
}

type Query {
  thing: String
}
`);
  const gql = getGql(extended);
  expect(gql`
    mutation {
      something
    }
  `).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "something": "",
  },
}
`);
});

test("basic mutation with existing mutations", () => {
  const queryAndMutation = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        thing: graphql.field({
          type: graphql.String,
          resolve() {
            return "Thing";
          },
        }),
      },
    }).graphQLType,
    mutation: graphql.object()({
      name: "Mutation",
      fields: {
        thing: graphql.field({
          type: graphql.String,
          resolve() {
            return "Thing";
          },
        }),
      },
    }).graphQLType,
  });
  const extended = extend({
    mutation: {
      something: graphql.field({
        type: graphql.String,
        resolve() {
          return "";
        },
      }),
    },
  })(queryAndMutation);
  expect(extended).toMatchInlineSnapshot(`
type Query {
  thing: String
}

type Mutation {
  thing: String
  something: String
}
`);
  const gql = getGql(extended);
  expect(gql`
    mutation {
      something
    }
  `).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "something": "",
  },
}
`);
});

test("errors when query type is used elsewhere in schema", () => {
  const Query: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
      other: graphql.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query.graphQLType,
  });
  try {
    extend({
      mutation: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    })(initial);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.message).toMatchInlineSnapshot(`
"@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
- Query is used at Query.other"
`);
  }
});

test("errors when query and mutation type is used elsewhere in schema", () => {
  const Query: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
    }),
  });
  const Mutation: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Mutation",
    fields: () => ({
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
      other: graphql.field({
        type: Mutation,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query.graphQLType,
    mutation: Mutation.graphQLType,
  });
  try {
    extend({
      mutation: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    })(initial);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.message).toMatchInlineSnapshot(`
"@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
- Mutation is used at Mutation.other"
`);
  }
});

test("errors when query and mutation type is used elsewhere in schema", () => {
  const Query: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
      other: graphql.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
      otherBlah: graphql.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const Mutation: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Mutation",
    fields: () => ({
      thing: graphql.field({
        type: graphql.String,
        resolve() {
          return "Thing";
        },
      }),
      other: graphql.field({
        type: Mutation,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query.graphQLType,
    mutation: Mutation.graphQLType,
  });
  try {
    extend({
      mutation: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    })(initial);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.message).toMatchInlineSnapshot(`
"@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
- Query is used at Query.other, Query.otherBlah
- Mutation is used at Mutation.other"
`);
  }
});
