import {
  GraphQLScalarType,
  GraphQLSchema,
  graphqlSync,
  printSchema,
} from "graphql";
import { gWithContext } from "@graphql-ts/schema";
import { extend } from ".";

const g = gWithContext();
type g<T> = gWithContext.infer<T>;

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
  query: g.object()({
    name: "Query",
    fields: {
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
    },
  }),
});

test("basic query", () => {
  const extended = extend({
    query: {
      hello: g.field({
        type: g.String,
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
      something: g.field({
        type: g.String,
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
    query: g.object()({
      name: "Query",
      fields: {
        thing: g.field({
          type: g.String,
          resolve() {
            return "Thing";
          },
        }),
      },
    }),
    mutation: g.object()({
      name: "Mutation",
      fields: {
        thing: g.field({
          type: g.String,
          resolve() {
            return "Thing";
          },
        }),
      },
    }),
  });
  const extended = extend({
    mutation: {
      something: g.field({
        type: g.String,
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
  const Query: g<typeof g.object<{}>> = g.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
      other: g.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query,
  });
  expect(() => {
    extend({
      mutation: {
        something: g.field({
          type: g.String,
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
  const Query: g<typeof g.object<{}>> = g.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
    }),
  });
  const Mutation: g<typeof g.object<{}>> = g.object<{}>()({
    name: "Mutation",
    fields: () => ({
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
      other: g.field({
        type: Mutation,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
  });
  expect(() => {
    extend({
      mutation: {
        something: g.field({
          type: g.String,
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
  const Query: g<typeof g.object<{}>> = g.object<{}>()({
    name: "Query",
    fields: () => ({
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
      other: g.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
      otherBlah: g.field({
        type: Query,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const Mutation: g<typeof g.object<{}>> = g.object<{}>()({
    name: "Mutation",
    fields: () => ({
      thing: g.field({
        type: g.String,
        resolve() {
          return "Thing";
        },
      }),
      other: g.field({
        type: Mutation,
        resolve() {
          return {};
        },
      }),
    }),
  });
  const initial = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
  });
  expect(() => {
    extend({
      mutation: {
        something: g.field({
          type: g.String,
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
      hello: g.field({
        type: g.String,
        args: {
          thing: g.arg({ type: g.String }),
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.object()({
            name: "Something",
            fields: {
              something: g.field({
                type: g.String,
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
    }),
  });
  const extended = extend((base) => ({
    query: {
      hello: g.field({
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

test("errors when no type exists with that name", () => {
  expect(() => {
    extend((base) => ({
      query: {
        hello: g.field({
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.String,
          args: {
            a: g.arg({
              type: g.inputObject({
                name: "Something",
                fields: {
                  something: g.arg({ type: g.String }),
                },
              }),
            }),
          },
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  expect(() => {
    extend((base) => ({
      query: {
        hello: g.field({
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.String,
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  expect(() => {
    extend((base) => ({
      query: {
        hello: g.field({
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
  const Something = g.scalar(
    new GraphQLScalarType({
      name: "Something",
    })
  );
  const initial = new GraphQLSchema({
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: Something,
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  const extended = extend<{
    Something: typeof Something;
  }>((base) => ({
    query: {
      hello: g.field({
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.String,
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  expect(() => {
    extend({
      query: {
        something: g.field({
          type: g.Int,
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.String,
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  expect(() => {
    extend([
      {
        query: {
          another: g.field({ type: g.Int, resolve: () => 1 }),
        },
      },
      {
        query: {
          another: g.field({
            type: g.Boolean,
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
    query: g.object()({
      name: "Query",
      fields: {
        something: g.field({
          type: g.String,
          resolve() {
            return "";
          },
        }),
      },
    }),
  });
  const extended = extend([
    {
      query: {
        another: g.field({ type: g.Int, resolve: () => 1 }),
      },
    },
    {
      query: {
        alwaysTrue: g.field({
          type: g.Boolean,
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
