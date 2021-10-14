import {
  GraphQLScalarType,
  GraphQLSchema,
  graphqlSync,
  printSchema,
} from "graphql";
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
  serialize(val) {
    return printSchema(val as GraphQLSchema).trim();
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
  expect(() => {
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
  }).toThrowErrorMatchingInlineSnapshot(`
    "@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
    - \\"Query\\" is used at \\"Query.other\\""
  `);
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
  expect(() => {
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
  }).toThrowErrorMatchingInlineSnapshot(`
    "@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
    - \\"Mutation\\" is used at \\"Mutation.other\\""
  `);
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
  expect(() => {
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
  }).toThrowErrorMatchingInlineSnapshot(`
    "@graphql-ts/extend doesn't yet support using the query and mutation types in other types but
    - \\"Query\\" is used at \\"Query.other\\", \\"Query.otherBlah\\"
    - \\"Mutation\\" is used at \\"Mutation.other\\""
  `);
});

test("basic query with args", () => {
  const extended = extend({
    query: {
      hello: graphql.field({
        type: graphql.String,
        args: {
          thing: graphql.arg({ type: graphql.String }),
        },
        resolve(_, { thing }) {
          return thing;
        },
      }),
    },
  })(onlyQuery);
  expect(extended).toMatchInlineSnapshot(`
    type Query {
      thing: String
      hello(thing: String): String
    }
  `);
  const gql = getGql(extended);
  expect(gql`
    query {
      hello(thing: "something")
      thing
    }
  `).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "hello": "something",
        "thing": "Thing",
      },
    }
  `);
});

test("using an existing object type", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.object()({
            name: "Something",
            fields: {
              something: graphql.field({
                type: graphql.String,
                resolve() {
                  return "Something";
                },
              }),
            },
          }),
          resolve() {
            return {};
          },
        }),
      },
    }).graphQLType,
  });
  const extended = extend((base) => ({
    query: {
      hello: graphql.field({
        type: base.object("Something"),
        resolve() {
          return {};
        },
      }),
    },
  }))(initial);
  expect(extended).toMatchInlineSnapshot(`
    type Query {
      something: Something
      hello: Something
    }

    type Something {
      something: String
    }
  `);
  const gql = getGql(extended);
  expect(gql`
    query {
      hello {
        something
      }
      something {
        something
      }
    }
  `).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "hello": Object {
          "something": "Something",
        },
        "something": Object {
          "something": "Something",
        },
      },
    }
  `);
});

test("errors when no type ", () => {
  expect(() => {
    extend((base) => ({
      query: {
        hello: graphql.field({
          type: base.object("Something"),
          resolve() {
            return {};
          },
        }),
      },
    }))(onlyQuery);
  }).toThrowErrorMatchingInlineSnapshot(
    `"No type named \\"Something\\" exists in the schema that is being extended"`
  );
});

test("errors when the type isn't an object type", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.String,
          args: {
            a: graphql.arg({
              type: graphql.inputObject({
                name: "Something",
                fields: {
                  something: graphql.arg({ type: graphql.String }),
                },
              }),
            }),
          },
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  expect(() => {
    extend((base) => ({
      query: {
        hello: graphql.field({
          type: base.object("Something"),
          resolve() {
            return {};
          },
        }),
      },
    }))(initial);
  }).toThrowErrorMatchingInlineSnapshot(
    `"There is a type named \\"Something\\" in the schema being extended but it is not an object type"`
  );
});

test(".scalar throws for built-in scalars", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  expect(() => {
    extend((base) => ({
      query: {
        hello: graphql.field({
          type: base.scalar("String"),
          resolve() {
            return {};
          },
        }),
      },
    }))(initial);
  }).toThrowErrorMatchingInlineSnapshot(
    `"The names of built-in scalars cannot be passed to BaseSchemaInfo.scalar but String was passed"`
  );
});

test(".scalar works for custom scalars", () => {
  const Something = graphql.scalar(
    new GraphQLScalarType({
      name: "Something",
    })
  );
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: Something,
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  const extended = extend((base) => ({
    query: {
      hello: graphql.field({
        type: base.scalar("Something"),
        resolve() {
          return "";
        },
      }),
    },
  }))(initial);
  expect(extended).toMatchInlineSnapshot(`
    type Query {
      something: Something
      hello: Something
    }

    scalar Something
  `);
});

test("a good error when there is already a field with the same name in the original type", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  expect(() => {
    extend({
      query: {
        something: graphql.field({
          type: graphql.Int,
          resolve() {
            return 1;
          },
        }),
      },
    })(initial);
  }).toThrowErrorMatchingInlineSnapshot(`
    "The schema extension defines a field \\"something\\" on the \\"Query\\" type but that type already defines a field with that name.
    The original field:
    something: String
    The field added by the extension:
    something: Int"
  `);
});

test("a good error when multiple extensions add a field with the same name", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  expect(() => {
    extend([
      {
        query: {
          another: graphql.field({ type: graphql.Int, resolve: () => 1 }),
        },
      },
      {
        query: {
          another: graphql.field({
            type: graphql.Boolean,
            resolve: () => true,
          }),
        },
      },
    ])(initial);
  }).toThrowErrorMatchingInlineSnapshot(`
    "More than one extension defines a field named \\"another\\" on the query type.
    The first field:
    another: Boolean
    The second field:
    another: Int"
  `);
});

test("multiple extensions work", () => {
  const initial = new GraphQLSchema({
    query: graphql.object()({
      name: "Query",
      fields: {
        something: graphql.field({
          type: graphql.String,
          resolve() {
            return "";
          },
        }),
      },
    }).graphQLType,
  });
  const extended = extend([
    {
      query: {
        another: graphql.field({ type: graphql.Int, resolve: () => 1 }),
      },
    },
    {
      query: {
        alwaysTrue: graphql.field({
          type: graphql.Boolean,
          resolve: () => true,
        }),
      },
    },
  ])(initial);

  expect(extended).toMatchInlineSnapshot(`
type Query {
  something: String
  another: Int
  alwaysTrue: Boolean
}
`);
});
