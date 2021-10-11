import {
  graphql,
  bindGraphQLSchemaAPIToContext,
  Arg,
  InferValueFromInputType,
  InputObjectType,
  ScalarType,
  InferValueFromOutputType,
} from "@graphql-ts/schema";
import * as graphqlWithContext from "./schema-api";

// this isn't really right
function expectType<T>(type: T) {
  console.log(type);
}

graphqlWithContext.arg({
  type: graphqlWithContext.Boolean,
});

const someEnum = graphql.enum({
  name: "SomeEnum",
  values: graphql.enumValues(["a", "b"]),
});

const enumArg = graphql.arg({
  type: someEnum,
});

const Something = graphql.inputObject({
  name: "Something",
  fields: {
    nullableString: graphql.arg({ type: graphql.String }),
    nullableStringWithDefaultValue: graphql.arg({
      type: graphql.String,
      defaultValue: "something",
    }),
    nonNullableString: graphql.arg({
      type: graphql.nonNull(graphql.String),
    }),
    nonNullableStringWithDefaultValue: graphql.arg({
      type: graphql.nonNull(graphql.String),
      defaultValue: "something",
    }),
    enum: enumArg,
  },
});

type CircularInputType = graphql.InputObjectType<{
  circular: graphql.Arg<CircularInputType>;
}>;

const Circular: CircularInputType = graphql.inputObject({
  name: "Circular",
  fields: () => ({
    circular: graphql.arg({ type: Circular }),
  }),
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

// this is all just to make ts's no unused local errors go away

function useType<T>(a?: T) {
  console.log(a);
}

{
  // should be unknown
  type a = graphql.InferValueFromOutputType<graphql.OutputType>;
  useType<a>();
}
{
  // should be unknown
  type a = graphql.InferValueFromInputType<graphql.InputType>;
  useType<a>();
  type b = graphql.InferValueFromArg<graphql.Arg<graphql.InputType>>;
  useType<b>();
  // should be { readonly a: unknown }
  type c = graphql.InferValueFromArgs<{ a: graphql.Arg<graphql.InputType> }>;
  useType<c>();
}

{
  type RecursiveInput = InputObjectType<{
    nullableString: Arg<ScalarType<string>>;
    recursive: Arg<RecursiveInput>;
  }>;

  const Recursive: RecursiveInput = graphql.inputObject({
    name: "Recursive",
    fields: () => ({
      nullableString: graphql.arg({ type: graphql.String }),
      recursive: graphql.arg({ type: Recursive }),
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
    nullableString: graphql.arg({ type: graphql.String }),
  };

  type RecursiveInput = InputObjectType<
    typeof nonRecursiveFields & {
      recursive: Arg<RecursiveInput, any>;
    }
  >;

  const Recursive: RecursiveInput = graphql.inputObject({
    name: "Recursive",
    fields: () => ({
      ...nonRecursiveFields,
      recursive: graphql.arg({ type: Recursive }),
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
  nullableString: Arg<typeof graphql.String>;
}> = graphql.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: graphql.arg({ type: graphql.String }),
    another: graphql.arg({ type: graphql.String }),
  }),
});

graphql.object<{ id: string } | { id: "str" }>()({
  name: "Node",
  fields: {
    id: graphql.field({
      type: graphql.nonNull(graphql.ID),
    }),
  },
});

graphql.object<{ id: string } | { id: boolean }>()({
  name: "Node",
  fields: {
    // @ts-expect-error
    id: graphql.field({
      type: graphql.nonNull(graphql.ID),
    }),
  },
});

{
  const graphql = {
    ...graphqlWithContext,
    ...bindGraphQLSchemaAPIToContext<{ isAdminUIBuildProcess: true }>(),
  };

  const SomeOutput = graphql.object<{ thing: boolean }>()({
    name: "Something",
    fields: {
      thing: graphql.field({ type: graphql.nonNull(graphql.Boolean) }),
    },
  });

  const nonNullSomeOutput = graphql.nonNull(SomeOutput);

  type OutputTypeWithNull = InferValueFromOutputType<typeof SomeOutput>;

  expectType<OutputTypeWithNull>({ thing: true });
  expectType<OutputTypeWithNull>(null);

  type OutputTypeWithoutNull = InferValueFromOutputType<
    typeof nonNullSomeOutput
  >;

  expectType<OutputTypeWithoutNull>({ thing: true });

  graphql.field({
    type: SomeOutput,
    resolve() {
      if (Math.random() > 0.5) {
        return null;
      }
      return { thing: false };
    },
  });

  graphql.field({
    type: graphql.nonNull(graphql.list(nonNullSomeOutput)),
    resolve() {
      return [{ thing: false }];
    },
  });

  type FieldIdentifier = { listKey: string; fieldPath: string };

  graphql.fields<{ path: string; listKey: string }>()({
    thing: graphql.field({
      resolve(rootVal) {
        return { fieldPath: rootVal.path, listKey: rootVal.listKey };
      },
      type: graphql.nonNull(
        graphql.object<FieldIdentifier>()({
          name: "KeystoneAdminUIFieldMetaListView",
          fields: {
            fieldMode: graphql.field({
              type: graphql.nonNull(
                graphql.enum({
                  name: "KeystoneAdminUIFieldMetaListViewFieldMode",
                  values: graphql.enumValues(["read", "hidden"]),
                })
              ),
              async resolve(rootVal, args, context) {
                console.log(rootVal, args, context);
                return "read" as const;
              },
            }),
          },
        })
      ),
    }),
  });
}

// graphql.interface<{ kind: "one"; id: string } | { kind: "two"; id: boolean }>()({
//   name: "Node",
//   fields: {
//     id: graphql.field({
//       type: graphql.nonNull(graphql.ID),
//       // args: {},
//       resolve({}, {}) {
//         return true;
//       },
//     }),
//   },
// });

{
  const sharedFields = graphql.fields<{ something: string }>()({
    something: graphql.field({
      type: graphql.nonNull(graphql.String),
    }),
  });

  const sharedFieldsWithUnkownRootVal = graphql.fields()({
    other: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve() {
        return "";
      },
    }),
  });

  graphql.object<{ something: string; other: string }>()({
    name: "",
    fields: {
      ...sharedFields,
      ...sharedFieldsWithUnkownRootVal,
    },
  });

  graphql.object<{ other: string }>()({
    name: "",
    fields: sharedFieldsWithUnkownRootVal,
  });

  graphql.object<{ other: string }>()({
    name: "",
    // @ts-expect-error
    fields: sharedFields,
  });
}

{
  const typesWithContextA =
    bindGraphQLSchemaAPIToContext<{ something: boolean }>();

  const typesWithContextB =
    bindGraphQLSchemaAPIToContext<{ something: boolean; other: string }>();

  {
    typesWithContextB.object<{ thing: string }>()({
      name: "",
      fields: {
        thing: typesWithContextA.field({
          type: graphql.String,
        }),
      },
    });
    typesWithContextA.object<{ thing: string }>()({
      name: "",
      fields: {
        // @ts-expect-error
        thing: typesWithContextB.field({
          type: graphql.String,
        }),
      },
    });
  }

  {
    const fromA = typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          type: graphql.String,
          resolve(rootVal, args, context) {
            console.log(rootVal, args, context);
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
            console.log(rootVal, args, context);
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
            console.log(rootVal, args, context);
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
          type: graphql.list(fromBWithA),
          resolve(rootVal, args, context) {
            console.log(rootVal, args, context);
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
          type: graphql.list(graphql.list(fromBWithA)),
          resolve(rootVal, args, context) {
            console.log(rootVal, args, context);
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
          type: graphql.nonNull(fromBWithA),
          resolve(rootVal, args, context) {
            console.log(rootVal, args, context);
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
          type: graphql.list(graphql.nonNull(fromBWithA)),
          resolve(rootVal, args, context) {
            console.log(rootVal, args, context);
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
  }
}

{
  const nonNullThing = graphql.nonNull(graphql.String);
  graphql.nonNull(
    // @ts-expect-error
    nonNullThing
  );
}

{
  const Node = graphql.interface()({
    name: "Node",
    fields: {
      id: graphql.interfaceField({ type: graphql.ID }),
    },
  });

  graphql.object<{ id: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: { id: graphql.field({ type: graphql.ID }) },
  });

  graphql.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  graphql.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {
      thing: graphql.field({ type: graphql.ID }),
    },
  });
  graphql.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: graphql.field({ type: graphql.Int }),
    },
  });
  graphql.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: graphql.field({ type: graphql.ID }),
    },
  });

  {
    const NodeAnother = graphql.interface()({
      name: "Node",
      fields: {
        id: graphql.interfaceField({ type: graphql.Int }),
      },
    });

    graphql.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, NodeAnother],
      fields: {
        // @ts-expect-error
        id: graphql.field({ type: graphql.ID }),
      },
    });
  }

  graphql.interface()({
    name: "Node",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  {
    const Other = graphql.interface()({
      name: "Node",
      fields: { something: graphql.interfaceField({ type: graphql.Int }) },
    });
    graphql.object<{ id: string; something: number }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      fields: {
        id: graphql.field({ type: graphql.ID }),
        something: graphql.field({ type: graphql.Int }),
      },
    });
    graphql.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      // @ts-expect-error
      fields: {
        id: graphql.field({ type: graphql.ID }),
      },
    });
  }
}

graphql.object()({
  name: "Something",
  fields: {
    id: graphql.field({
      type: graphql.ID,

      resolve(rootVal, args) {
        console.log(rootVal);
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

  const ImageExtensionEnum = graphql.enum({
    name: "ImageExtension",
    values: graphql.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
  });

  type ImageData = {
    mode: ImageMode;
    id: string;
    extension: ImageExtension;
    filesize: number;
    width: number;
    height: number;
  };
  const imageOutputFields = graphql.fields<ImageData>()({
    id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    height: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    width: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    extension: graphql.field({ type: graphql.nonNull(ImageExtensionEnum) }),
    ref: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data) {
        console.log(data);
        return "";
      },
    }),
    src: graphql.field({
      type: graphql.nonNull(graphql.String),
      args: {},
      resolve(data, {}, context) {
        console.log(data, context);
        return "";
      },
    }),
  });

  const ImageFieldOutput = graphql.interface()({
    name: "ImageFieldOutput",
    fields: imageOutputFields,
  });

  const LocalImageFieldOutput = graphql.object<ImageData>()({
    name: "LocalImageFieldOutput",
    interfaces: [ImageFieldOutput],
    fields: imageOutputFields,
  });
  console.log(LocalImageFieldOutput);
}

graphql.fields<{ thing: Promise<string>[] }>()({
  thing: graphql.field({
    type: graphql.list(graphql.String),
  }),
});

graphql.fields()({
  thing: graphql.field({
    type: graphql.list(graphql.String),
    resolve() {
      return [Promise.resolve("")];
    },
  }),
});

graphql.fields<{ thing: Promise<string> }>()({
  thing: graphql.field({
    type: graphql.String,
  }),
});

// note it's important that the type annotation is on another variable declaration
// since the type annotation can influence the return type and we don't want that here

{
  const arg = graphql.arg({
    type: graphql.String,
  });

  const _assert: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert);
}

{
  const arg = graphql.arg({
    type: graphql.String,
    defaultValue: undefined,
  });

  const _assert: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert);
}

{
  const arg = graphql.arg({
    type: graphql.String,
    defaultValue: "",
  });

  const _assert: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert);
}

{
  const arg = graphql.arg({
    type: graphql.String,
    defaultValue: null,
  });

  const _assert: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert);
}

{
  const arg = graphql.arg({
    type: graphql.String,
    defaultValue: null,
  });

  const _assert: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert);
}

{
  const arg = graphql.arg({
    type: graphql.String,
    defaultValue: Math.random() > 0.5 ? "" : null,
  });

  const _assert: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert);
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
  const arg = graphql.arg({
    type: graphql.String,
    ...x,
  });

  const _assert: graphql.Arg<typeof graphql.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert2);
  const _assert3: (x: graphql.Arg<typeof graphql.String, boolean>) => void = (
    x: typeof arg
  ) => {
    console.log(x);
  };
  console.log(_assert3);
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
  const arg = graphql.arg({
    type: graphql.String,
    ...x,
  });

  const _assert: graphql.Arg<typeof graphql.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert2);
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
  const arg = graphql.arg({
    type: graphql.String,
    ...x,
  });
  const _assert: graphql.Arg<typeof graphql.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert2);
}

{
  const thing: { defaultValue: undefined } | { defaultValue: string } =
    Math.random() > 0.5 ? { defaultValue: undefined } : { defaultValue: "" };
  const arg = graphql.arg({
    type: graphql.String,
    ...thing,
  });

  const _assert: graphql.Arg<typeof graphql.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: graphql.Arg<typeof graphql.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: graphql.Arg<typeof graphql.String, true> = arg;
  console.log(_assert2);
}

graphql.arg({
  type: graphql.String,
  // @ts-expect-error
  defaultValue: 1,
});

graphql.arg({
  type: graphql.String,
  // @ts-expect-error
  bad: true,
});

graphql.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: graphql.field({
      type: graphql.String,
      args: { a: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
    }),
  },
});

graphql.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
      args: { a: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
    }),
  },
});

graphql.object<{ thing: () => string }>()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
      args: { a: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
    }),
  },
});

graphql.object<{ thing: () => Promise<string> }>()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

{
  // @ts-expect-error
  const thing1: graphql.NullableInputType = graphql.list(
    graphql.object()({
      name: "something",
      fields: {},
    })
  );
  // @ts-expect-error
  const thing2: graphql.NullableInputType = graphql.nonNull(
    graphql.object()({
      name: "something",
      fields: {},
    })
  );
  // @ts-expect-error
  const thing3: graphql.InputType = graphql.nonNull(
    graphql.object()({
      name: "something",
      fields: {},
    })
  );
}

graphql.object<{}>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

graphql.object<{ thing?: string }>()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

graphql.object<{ thing?: boolean }>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

graphql.object<{}>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

graphql.object<{ thing?: undefined }>()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
    }),
  },
});

graphql.object()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
      // @ts-expect-error
      resolve() {},
    }),
  },
});

graphql.object()({
  name: "Thing",
  fields: {
    thing: graphql.field({
      type: graphql.String,
      resolve() {
        return undefined;
      },
    }),
  },
});

graphql.object<any>()({
  name: "Thing",
  fields: {
    thing: graphql.field({ type: graphql.String }),
  },
});

{
  type AssetMode = "a" | "b";

  type FileData = {
    mode: AssetMode;
    filename: string;
    filesize: number;
  };

  const fileFields = graphql.fields<FileData>()({
    filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
    filesize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    ref: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data) {
        console.log(data);
        return "";
      },
    }),
    src: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve(data, args, context) {
        console.log(data, args, context);
        return "";
      },
    }),
  });

  const FileFieldOutput = graphql.interface<FileData>()({
    name: "FileFieldOutput",
    fields: fileFields,
    resolveType: () => "LocalFileFieldOutput",
  });

  graphql.field({
    type: FileFieldOutput,
    resolve() {
      return undefined as any as FileData;
    },
  });
}
