import {
  schema,
  bindSchemaAPIToContext,
  Arg,
  InferValueFromInputType,
  InputObjectType,
  ScalarType,
  InferValueFromOutputType,
} from "@graphql-ts/schema";
import * as schemaWithContext from "./schema-api";

// this isn't really right
function expectType<T>(type: T) {}

schemaWithContext.arg({
  type: schemaWithContext.Boolean,
});

const someEnum = schema.enum({
  name: "SomeEnum",
  values: schema.enumValues(["a", "b"]),
});

const enumArg = schema.arg({
  type: someEnum,
});

const Something = schema.inputObject({
  name: "Something",
  fields: {
    nullableString: schema.arg({ type: schema.String }),
    nullableStringWithDefaultValue: schema.arg({
      type: schema.String,
      defaultValue: "something",
    }),
    nonNullableString: schema.arg({
      type: schema.nonNull(schema.String),
    }),
    nonNullableStringWithDefaultValue: schema.arg({
      type: schema.nonNull(schema.String),
      defaultValue: "something",
    }),
    enum: enumArg,
  },
});

{
  type SomethingType = InferValueFromInputType<typeof Something>;

  const valOfSomethingType: SomethingType = undefined as any;

  expectType<{
    readonly nullableString: string | null | undefined;
    readonly nullableStringWithDefaultValue: string | null;
    readonly nonNullableString: string;
    readonly nonNullableStringWithDefaultValue: string;
    readonly enum: "a" | "b" | null | undefined;
  } | null>(valOfSomethingType);
}

{
  type RecursiveInput = InputObjectType<{
    nullableString: Arg<ScalarType<string>, any>;
    recursive: Arg<RecursiveInput, any>;
  }>;

  const Recursive: RecursiveInput = schema.inputObject({
    name: "Recursive",
    fields: () => ({
      nullableString: schema.arg({ type: schema.String }),
      recursive: schema.arg({ type: Recursive }),
    }),
  });

  type RecursiveInputType = InferValueFromInputType<typeof Recursive>;

  const valOfRecursiveInputType: RecursiveInputType = undefined as any;

  type RecursiveTypeExpect = {
    readonly nullableString: string | null | undefined;
    readonly recursive: RecursiveTypeExpect | null | undefined;
  } | null;

  expectType<RecursiveTypeExpect>(valOfRecursiveInputType);
}

{
  const nonRecursiveFields = {
    nullableString: schema.arg({ type: schema.String }),
  };

  type RecursiveInput = InputObjectType<
    typeof nonRecursiveFields & {
      recursive: Arg<RecursiveInput, any>;
    }
  >;

  const Recursive: RecursiveInput = schema.inputObject({
    name: "Recursive",
    fields: () => ({
      ...nonRecursiveFields,
      recursive: schema.arg({ type: Recursive }),
    }),
  });

  type RecursiveInputType = InferValueFromInputType<typeof Recursive>;

  const valOfRecursiveInputType: RecursiveInputType = undefined as any;

  type RecursiveTypeExpect = {
    readonly nullableString: string | null | undefined;
    readonly recursive: RecursiveTypeExpect | null | undefined;
  } | null;

  expectType<RecursiveTypeExpect>(valOfRecursiveInputType);
}

// TODO: if possible, this should error. not really a massive deal if it doesn't though tbh
// since if people forget to add something here, they will see an error when they try to read a field that doesn't exist
export const ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls: InputObjectType<{
  nullableString: Arg<typeof schema.String>;
}> = schema.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: schema.arg({ type: schema.String }),
    another: schema.arg({ type: schema.String }),
  }),
});

schema.object<{ id: string } | { id: "str" }>()({
  name: "Node",
  fields: {
    id: schema.field({
      type: schema.nonNull(schema.ID),
    }),
  },
});

schema.object<{ id: string } | { id: boolean }>()({
  name: "Node",
  fields: {
    // @ts-expect-error
    id: schema.field({
      type: schema.nonNull(schema.ID),
    }),
  },
});

{
  const types = {
    ...schemaWithContext,
    ...bindSchemaAPIToContext<{ isAdminUIBuildProcess: true }>(),
  };

  const SomeOutput = types.object<{ thing: boolean }>()({
    name: "Something",
    fields: {
      thing: types.field({ type: types.nonNull(types.Boolean) }),
    },
  });

  const nonNullSomeOutput = types.nonNull(SomeOutput);

  type OutputTypeWithNull = InferValueFromOutputType<typeof SomeOutput>;

  expectType<OutputTypeWithNull>({ thing: true });
  expectType<OutputTypeWithNull>(null);

  type OutputTypeWithoutNull = InferValueFromOutputType<
    typeof nonNullSomeOutput
  >;

  expectType<OutputTypeWithoutNull>({ thing: true });

  types.field({
    type: SomeOutput,
    resolve() {
      if (Math.random() > 0.5) {
        return null;
      }
      return { thing: false };
    },
  });

  types.field({
    type: types.nonNull(types.list(nonNullSomeOutput)),
    resolve() {
      return [{ thing: false }];
    },
  });

  type FieldIdentifier = { listKey: string; fieldPath: string };

  types.fields<{ path: string; listKey: string }>()({
    thing: types.field({
      resolve(rootVal) {
        return { fieldPath: rootVal.path, listKey: rootVal.listKey };
      },
      type: types.nonNull(
        types.object<FieldIdentifier>()({
          name: "KeystoneAdminUIFieldMetaListView",
          fields: {
            fieldMode: types.field({
              type: types.nonNull(
                types.enum({
                  name: "KeystoneAdminUIFieldMetaListViewFieldMode",
                  values: types.enumValues(["read", "hidden"]),
                })
              ),
              async resolve(rootVal, args, context) {
                return "read" as const;
              },
            }),
          },
        })
      ),
    }),
  });
}

// types.interface<{ kind: "one"; id: string } | { kind: "two"; id: boolean }>()({
//   name: "Node",
//   fields: {
//     id: types.field({
//       type: types.nonNull(types.ID),
//       // args: {},
//       resolve({}, {}) {
//         return true;
//       },
//     }),
//   },
// });

{
  const sharedFields = schema.fields<{ something: string }>()({
    something: schema.field({
      type: schema.nonNull(schema.String),
    }),
  });

  const sharedFieldsWithUnkownRootVal = schema.fields()({
    other: schema.field({
      type: schema.nonNull(schema.String),
      resolve() {
        return "";
      },
    }),
  });

  schema.object<{ something: string; other: string }>()({
    name: "",
    fields: {
      ...sharedFields,
      ...sharedFieldsWithUnkownRootVal,
    },
  });

  schema.object<{ other: string }>()({
    name: "",
    fields: sharedFieldsWithUnkownRootVal,
  });

  schema.object<{ other: string }>()({
    name: "",
    // @ts-expect-error
    fields: sharedFields,
  });
}

{
  const typesWithContextA = bindSchemaAPIToContext<{ something: boolean }>();

  const typesWithContextB =
    bindSchemaAPIToContext<{ something: boolean; other: string }>();

  {
    typesWithContextB.object<{ thing: string }>()({
      name: "",
      fields: {
        thing: typesWithContextA.field({
          type: schema.String,
        }),
      },
    });
    typesWithContextA.object<{ thing: string }>()({
      name: "",
      fields: {
        // @ts-expect-error
        thing: typesWithContextB.field({
          type: schema.String,
        }),
      },
    });
  }

  {
    const fromA = typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          type: schema.String,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
            return "";
          },
        }),
      },
    });
    const fromBWithA = typesWithContextB.object()({
      name: "Other",
      fields: {
        a: typesWithContextB.field({
          type: fromA,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean; other: string }>(context);
            return {};
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: fromBWithA,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: schema.list(fromBWithA),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: schema.list(schema.list(fromBWithA)),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: schema.nonNull(fromBWithA),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: schema.list(schema.nonNull(fromBWithA)),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
  }
}

{
  const nonNullThing = schema.nonNull(schema.String);
  schema.nonNull(
    // @ts-expect-error
    nonNullThing
  );
}

{
  const Node = schema.interface()({
    name: "Node",
    fields: {
      id: schema.interfaceField({ type: schema.ID }),
    },
  });

  schema.object<{ id: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: { id: schema.field({ type: schema.ID }) },
  });

  schema.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  schema.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {
      thing: schema.field({ type: schema.ID }),
    },
  });
  schema.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: schema.field({ type: schema.Int }),
    },
  });
  schema.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: schema.field({ type: schema.ID }),
    },
  });

  {
    const NodeAnother = schema.interface()({
      name: "Node",
      fields: {
        id: schema.interfaceField({ type: schema.Int }),
      },
    });

    schema.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, NodeAnother],
      fields: {
        // @ts-expect-error
        id: schema.field({ type: schema.ID }),
      },
    });
  }

  schema.interface()({
    name: "Node",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  {
    const Other = schema.interface()({
      name: "Node",
      fields: { something: schema.interfaceField({ type: schema.Int }) },
    });
    schema.object<{ id: string; something: number }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      fields: {
        id: schema.field({ type: schema.ID }),
        something: schema.field({ type: schema.Int }),
      },
    });
    schema.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      // @ts-expect-error
      fields: {
        id: schema.field({ type: schema.ID }),
      },
    });
  }
}

schema.object()({
  name: "Something",
  fields: {
    id: schema.field({
      type: schema.ID,
      resolve(rootVal, args) {
        // @ts-expect-error
        args.something;
        return "";
      },
    }),
  },
});

{
  type ImageMode = "local";

  type ImageExtension = "jpg" | "png" | "webp" | "gif";

  const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "png", "webp", "gif"] as const;

  const ImageExtensionEnum = schema.enum({
    name: "ImageExtension",
    values: schema.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
  });

  type ImageData = {
    mode: ImageMode;
    id: string;
    extension: ImageExtension;
    filesize: number;
    width: number;
    height: number;
  };
  const imageOutputFields = schema.fields<ImageData>()({
    id: schema.field({ type: schema.nonNull(schema.ID) }),
    filesize: schema.field({ type: schema.nonNull(schema.Int) }),
    height: schema.field({ type: schema.nonNull(schema.Int) }),
    width: schema.field({ type: schema.nonNull(schema.Int) }),
    extension: schema.field({ type: schema.nonNull(ImageExtensionEnum) }),
    ref: schema.field({
      type: schema.nonNull(schema.String),
      resolve(data) {
        return "";
      },
    }),
    src: schema.field({
      type: schema.nonNull(schema.String),
      args: {},
      resolve(data, {}, context) {
        return "";
      },
    }),
  });

  const ImageFieldOutput = schema.interface()({
    name: "ImageFieldOutput",
    fields: imageOutputFields,
  });

  const LocalImageFieldOutput = schema.object<ImageData>()({
    name: "LocalImageFieldOutput",
    interfaces: [ImageFieldOutput],
    fields: imageOutputFields,
  });
}

schema.fields<{ thing: Promise<string>[] }>()({
  thing: schema.field({
    type: schema.list(schema.String),
  }),
});

schema.fields()({
  thing: schema.field({
    type: schema.list(schema.String),
    resolve() {
      return [Promise.resolve("")];
    },
  }),
});

schema.fields<{ thing: Promise<string> }>()({
  thing: schema.field({
    type: schema.String,
  }),
});

// note it's important that the type annotation is on another variable declaration
// since the type annotation can influence the return type and we don't want that here

{
  const arg = schema.arg({
    type: schema.String,
  });

  const _assert: schema.Arg<typeof schema.String, undefined> = arg;
}

{
  const arg = schema.arg({
    type: schema.String,
    defaultValue: undefined,
  });

  const _assert: schema.Arg<typeof schema.String, undefined> = arg;
}

{
  const arg = schema.arg({
    type: schema.String,
    defaultValue: "",
  });

  const _assert: schema.Arg<typeof schema.String, string> = arg;
}

{
  const arg = schema.arg({
    type: schema.String,
    defaultValue: null,
  });

  const _assert: schema.Arg<typeof schema.String, null> = arg;
}

{
  const arg = schema.arg({
    type: schema.String,
    defaultValue: null,
  });

  const _assert: schema.Arg<typeof schema.String, null> = arg;
}

{
  const arg = schema.arg({
    type: schema.String,
    defaultValue: Math.random() > 0.5 ? "" : null,
  });

  const _assert: schema.Arg<typeof schema.String, string | null> = arg;
  // @ts-expect-error
  const _assert1: schema.Arg<typeof schema.String, null> = arg;
  // @ts-expect-error
  const _assert2: schema.Arg<typeof schema.String, string> = arg;
}

{
  const x:
    | {
        defaultValue: string;
      }
    | {
        defaultValue?: undefined;
      } =
    Math.random() > 0.5
      ? {
          defaultValue: "",
        }
      : {};
  const arg = schema.arg({
    type: schema.String,
    ...x,
  });

  const _assert: schema.Arg<typeof schema.String, string | undefined> = arg;
  // @ts-expect-error
  const _assert1: schema.Arg<typeof schema.String, undefined> = arg;
  // @ts-expect-error
  const _assert2: schema.Arg<typeof schema.String, string> = arg;
  const _assert3: (
    x: schema.Arg<typeof schema.String, string | undefined>
  ) => void = (x: typeof arg) => {};
}

{
  const x:
    | {}
    | {
        defaultValue?: string;
      } =
    Math.random() > 0.5
      ? {
          defaultValue: "",
        }
      : {};
  const arg = schema.arg({
    type: schema.String,
    ...x,
  });

  const _assert: schema.Arg<typeof schema.String, string | undefined> = arg;
  // @ts-expect-error
  const _assert1: schema.Arg<typeof schema.String, undefined> = arg;
  // @ts-expect-error
  const _assert2: schema.Arg<typeof schema.String, string> = arg;
}

{
  const x:
    | {}
    | {
        defaultValue: string;
      } =
    Math.random() > 0.5
      ? {
          defaultValue: "",
        }
      : {};
  const arg = schema.arg({
    type: schema.String,
    ...x,
  });
  const _assert: schema.Arg<typeof schema.String, string | undefined> = arg;
  // @ts-expect-error
  const _assert1: schema.Arg<typeof schema.String, undefined> = arg;
  // @ts-expect-error
  const _assert2: schema.Arg<typeof schema.String, string> = arg;
}

{
  const thing: { defaultValue: undefined } | { defaultValue: string } =
    Math.random() > 0.5 ? { defaultValue: undefined } : { defaultValue: "" };
  const arg = schema.arg({
    type: schema.String,
    ...thing,
  });

  const _assert: schema.Arg<typeof schema.String, string | undefined> = arg;
  // @ts-expect-error
  const _assert1: schema.Arg<typeof schema.String, undefined> = arg;
  // @ts-expect-error
  const _assert2: schema.Arg<typeof schema.String, string> = arg;
}

schema.arg({
  type: schema.String,
  // @ts-expect-error
  defaultValue: 1,
});

schema.arg({
  type: schema.String,
  // @ts-expect-error
  bad: true,
});

schema.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: schema.field({
      type: schema.String,
      args: { a: schema.arg({ type: schema.nonNull(schema.Int) }) },
    }),
  },
});

schema.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    thing: schema.field({
      type: schema.String,
      args: { a: schema.arg({ type: schema.nonNull(schema.String) }) },
    }),
  },
});

schema.object<{ thing: () => string }>()({
  name: "Thing",
  fields: {
    thing: schema.field({
      type: schema.String,
      args: { a: schema.arg({ type: schema.nonNull(schema.String) }) },
    }),
  },
});

schema.object<{ thing: () => Promise<string> }>()({
  name: "Thing",
  fields: {
    thing: schema.field({
      type: schema.String,
    }),
  },
});
