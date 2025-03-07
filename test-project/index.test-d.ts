import {
  g,
  initG,
  Arg,
  InferValueFromInputType,
  InputObjectType,
  ScalarType,
  InferValueFromOutputType,
  graphql,
  OutputType,
  Field,
  InputType,
  InferValueFromArgs,
} from "@graphql-ts/schema";
import { extend } from "@graphql-ts/extend";
import * as gWithContext from "./schema-api";
import {
  GArg,
  GEnumType,
  GInputObjectType,
  GInputType,
  GInterfaceType,
  GList,
  GNonNull,
  GObjectType,
  GScalarType,
  GUnionType,
} from "@graphql-ts/schema/types";
import {
  GraphQLEnumType,
  GraphQLFieldExtensions,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";

// this isn't really right
function expectType<T>(type: T) {
  console.log(type);
}

gWithContext.arg({
  type: gWithContext.Boolean,
});

const someEnum = g.enum({
  name: "SomeEnum",
  values: g.enumValues(["a", "b"]),
});

const enumArg = g.arg({
  type: someEnum,
});

const Something = g.inputObject({
  name: "Something",
  fields: {
    nullableString: g.arg({ type: g.String }),
    nullableStringWithDefaultValue: g.arg({
      type: g.String,
      defaultValue: "something",
    }),
    nonNullableString: g.arg({
      type: g.nonNull(g.String),
    }),
    nonNullableStringWithDefaultValue: g.arg({
      type: g.nonNull(g.String),
      defaultValue: "something",
    }),
    enum: enumArg,
  },
});

type CircularInputType = g.InputObjectType<{
  circular: g.Arg<CircularInputType>;
}>;

const Circular: CircularInputType = g.inputObject({
  name: "Circular",
  fields: () => ({
    circular: g.arg({ type: Circular }),
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
  // should be unknown for G* types but for GraphQLOutputType, it is any
  type a = g.InferValueFromOutputType<g.OutputType>;
  useType<a>();
}
{
  // should be unknown
  type a = g.InferValueFromInputType<g.InputType>;
  useType<a>();
  type b = g.InferValueFromArg<g.Arg<g.InputType>>;
  useType<b>();
  // should be { readonly a: unknown }
  type c = g.InferValueFromArgs<{ a: g.Arg<g.InputType> }>;
  useType<c>();
}

{
  type RecursiveInput = InputObjectType<{
    nullableString: Arg<ScalarType<string>>;
    recursive: Arg<RecursiveInput>;
  }>;

  const Recursive: RecursiveInput = g.inputObject({
    name: "Recursive",
    fields: () => ({
      nullableString: g.arg({ type: g.String }),
      recursive: g.arg({ type: Recursive }),
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
    nullableString: g.arg({ type: g.String }),
  };

  type RecursiveInput = InputObjectType<
    typeof nonRecursiveFields & {
      recursive: Arg<RecursiveInput, any>;
    }
  >;

  const Recursive: RecursiveInput = g.inputObject({
    name: "Recursive",
    fields: () => ({
      ...nonRecursiveFields,
      recursive: g.arg({ type: Recursive }),
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
  nullableString: Arg<typeof g.String>;
}> = g.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: g.arg({ type: g.String }),
    another: g.arg({ type: g.String }),
  }),
});

g.object<{ id: string } | { id: "str" }>()({
  name: "Node",
  fields: {
    id: g.field({
      type: g.nonNull(g.ID),
    }),
  },
});

g.object<{ id: string } | { id: boolean }>()({
  name: "Node",
  fields: {
    // @ts-expect-error
    id: g.field({
      type: g.nonNull(g.ID),
    }),
  },
});

{
  const g = initG<{ isAdminUIBuildProcess: true }>();

  const SomeOutput = g.object<{ thing: boolean }>()({
    name: "Something",
    fields: {
      thing: g.field({ type: g.nonNull(g.Boolean) }),
    },
  });

  const nonNullSomeOutput = g.nonNull(SomeOutput);

  type OutputTypeWithNull = InferValueFromOutputType<typeof SomeOutput>;

  expectType<OutputTypeWithNull>({ thing: true });
  expectType<OutputTypeWithNull>(null);

  type OutputTypeWithoutNull = InferValueFromOutputType<
    typeof nonNullSomeOutput
  >;

  expectType<OutputTypeWithoutNull>({ thing: true });

  g.field({
    type: SomeOutput,
    resolve() {
      if (Math.random() > 0.5) {
        return null;
      }
      return { thing: false };
    },
  });

  g.field({
    type: g.nonNull(g.list(nonNullSomeOutput)),
    resolve() {
      return [{ thing: false }];
    },
  });

  type FieldIdentifier = { listKey: string; fieldPath: string };

  g.fields<{ path: string; listKey: string }>()({
    thing: g.field({
      resolve(source) {
        return { fieldPath: source.path, listKey: source.listKey };
      },
      type: g.nonNull(
        g.object<FieldIdentifier>()({
          name: "KeystoneAdminUIFieldMetaListView",
          fields: {
            fieldMode: g.field({
              type: g.nonNull(
                g.enum({
                  name: "KeystoneAdminUIFieldMetaListViewFieldMode",
                  values: g.enumValues(["read", "hidden"]),
                })
              ),
              async resolve(source, args, context) {
                console.log(source, args, context);
                return "read" as const;
              },
            }),
          },
        })
      ),
    }),
  });
}

// g.interface<{ kind: "one"; id: string } | { kind: "two"; id: boolean }>()({
//   name: "Node",
//   fields: {
//     id: g.field({
//       type: g.nonNull(g.ID),
//       // args: {},
//       resolve({}, {}) {
//         return true;
//       },
//     }),
//   },
// });

{
  const sharedFields = g.fields<{ something: string }>()({
    something: g.field({
      type: g.nonNull(g.String),
    }),
  });

  const sharedFieldsWithUnkownSource = g.fields()({
    other: g.field({
      type: g.nonNull(g.String),
      resolve() {
        return "";
      },
    }),
  });

  g.object<{ something: string; other: string }>()({
    name: "",
    fields: {
      ...sharedFields,
      ...sharedFieldsWithUnkownSource,
    },
  });

  g.object<{ other: string }>()({
    name: "",
    fields: sharedFieldsWithUnkownSource,
  });

  g.object<{ other: string }>()({
    name: "",
    // @ts-expect-error
    fields: sharedFields,
  });
}

{
  const typesWithContextA = initG<{
    something: boolean;
  }>();

  const typesWithContextB = initG<{
    something: boolean;
    other: string;
  }>();

  {
    typesWithContextB.object<{ thing: string }>()({
      name: "",
      fields: {
        thing: typesWithContextA.field({
          type: g.String,
        }),
      },
    });
    typesWithContextA.object<{ thing: string }>()({
      name: "",
      fields: {
        // @ts-expect-error
        thing: typesWithContextB.field({
          type: g.String,
        }),
      },
    });
  }

  {
    const A = typesWithContextB.object<{ thing: string }>()({
      name: "",
      fields: {
        thing: typesWithContextA.field({
          type: g.String,
        }),
      },
    });
    typesWithContextA.union({
      name: "",
      // @ts-expect-error
      types: [A],
    });
  }

  {
    const fromA = typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          type: g.String,
          resolve(source, args, context) {
            console.log(source, args, context);
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
          resolve(source, args, context) {
            console.log(source, args, context);
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
          resolve(source, args, context) {
            console.log(source, args, context);
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
          type: g.list(fromBWithA),
          resolve(source, args, context) {
            console.log(source, args, context);
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
          type: g.list(g.list(fromBWithA)),
          resolve(source, args, context) {
            console.log(source, args, context);
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
          type: g.nonNull(fromBWithA),
          resolve(source, args, context) {
            console.log(source, args, context);
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
          type: g.list(g.nonNull(fromBWithA)),
          resolve(source, args, context) {
            console.log(source, args, context);
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
  }
}

{
  const nonNullThing = g.nonNull(g.String);
  g.nonNull(
    // @ts-expect-error
    nonNullThing
  );
}

{
  const Node = g.interface()({
    name: "Node",
    fields: {
      id: g.interfaceField({ type: g.ID }),
    },
  });

  g.object<{ id: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: { id: g.field({ type: g.ID }) },
  });

  g.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  g.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {
      thing: g.field({ type: g.ID }),
    },
  });
  g.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: g.field({ type: g.Int }),
    },
  });
  g.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: g.field({ type: g.ID }),
    },
  });

  {
    const NodeAnother = g.interface()({
      name: "Node",
      fields: {
        id: g.interfaceField({ type: g.Int }),
      },
    });

    g.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, NodeAnother],
      fields: {
        // @ts-expect-error
        id: g.field({ type: g.ID }),
      },
    });
  }

  g.interface()({
    name: "Node",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  {
    const Other = g.interface()({
      name: "Node",
      fields: { something: g.interfaceField({ type: g.Int }) },
    });
    g.object<{ id: string; something: number }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      fields: {
        id: g.field({ type: g.ID }),
        something: g.field({ type: g.Int }),
      },
    });
    g.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      // @ts-expect-error
      fields: {
        id: g.field({ type: g.ID }),
      },
    });
  }
}

g.object()({
  name: "Something",
  fields: {
    id: g.field({
      type: g.ID,

      resolve(source, args) {
        console.log(source);
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

  const ImageExtensionEnum = g.enum({
    name: "ImageExtension",
    values: g.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
  });

  type ImageData = {
    mode: ImageMode;
    id: string;
    extension: ImageExtension;
    filesize: number;
    width: number;
    height: number;
  };
  const imageOutputFields = g.fields<ImageData>()({
    id: g.field({ type: g.nonNull(g.ID) }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    height: g.field({ type: g.nonNull(g.Int) }),
    width: g.field({ type: g.nonNull(g.Int) }),
    extension: g.field({ type: g.nonNull(ImageExtensionEnum) }),
    ref: g.field({
      type: g.nonNull(g.String),
      resolve(data) {
        console.log(data);
        return "";
      },
    }),
    src: g.field({
      type: g.nonNull(g.String),
      resolve(data, {}, context) {
        console.log(data, context);
        return "";
      },
    }),
  });

  const ImageFieldOutput = g.interface()({
    name: "ImageFieldOutput",
    fields: imageOutputFields,
  });

  const LocalImageFieldOutput = g.object<ImageData>()({
    name: "LocalImageFieldOutput",
    interfaces: [ImageFieldOutput],
    fields: imageOutputFields,
  });
  console.log(LocalImageFieldOutput);
}

g.fields<{ thing: Promise<string>[] }>()({
  thing: g.field({
    type: g.list(g.String),
  }),
});

g.fields()({
  thing: g.field({
    type: g.list(g.String),
    resolve() {
      return [Promise.resolve("")];
    },
  }),
});

g.fields<{ thing: Promise<string> }>()({
  thing: g.field({
    type: g.String,
  }),
});

// note it's important that the type annotation is on another variable declaration
// since the type annotation can influence the return type and we don't want that here

{
  const arg = g.arg({
    type: g.String,
  });

  const _assert: g.Arg<typeof g.String, false> = arg;
  console.log(_assert);
}

{
  const arg = g.arg({
    type: g.String,
    defaultValue: undefined,
  });

  const _assert: g.Arg<typeof g.String, false> = arg;
  console.log(_assert);
}

{
  const arg = g.arg({
    type: g.String,
    defaultValue: "",
  });

  const _assert: g.Arg<typeof g.String, true> = arg;
  console.log(_assert);
}

{
  const arg = g.arg({
    type: g.String,
    defaultValue: null,
  });

  const _assert: g.Arg<typeof g.String, true> = arg;
  console.log(_assert);
}

{
  const arg = g.arg({
    type: g.String,
    defaultValue: null,
  });

  const _assert: g.Arg<typeof g.String, true> = arg;
  console.log(_assert);
}

{
  const arg = g.arg({
    type: g.String,
    defaultValue: Math.random() > 0.5 ? "" : null,
  });

  const _assert: g.Arg<typeof g.String, true> = arg;
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
  const arg = g.arg({
    type: g.String,
    ...x,
  });

  const _assert: g.Arg<typeof g.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: g.Arg<typeof g.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: g.Arg<typeof g.String, true> = arg;
  console.log(_assert2);
  const _assert3: (x: g.Arg<typeof g.String, boolean>) => void = (
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
  const arg = g.arg({
    type: g.String,
    ...x,
  });

  const _assert: g.Arg<typeof g.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: g.Arg<typeof g.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: g.Arg<typeof g.String, true> = arg;
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
  const arg = g.arg({
    type: g.String,
    ...x,
  });
  const _assert: g.Arg<typeof g.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: g.Arg<typeof g.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: g.Arg<typeof g.String, true> = arg;
  console.log(_assert2);
}

{
  const thing: { defaultValue: undefined } | { defaultValue: string } =
    Math.random() > 0.5 ? { defaultValue: undefined } : { defaultValue: "" };
  const arg = g.arg({
    type: g.String,
    ...thing,
  });

  const _assert: g.Arg<typeof g.String, boolean> = arg;
  console.log(_assert);
  // @ts-expect-error
  const _assert1: g.Arg<typeof g.String, false> = arg;
  console.log(_assert1);
  // @ts-expect-error
  const _assert2: g.Arg<typeof g.String, true> = arg;
  console.log(_assert2);
}

g.arg({
  type: g.String,
  // @ts-expect-error
  defaultValue: 1,
});

g.arg({
  type: g.String,
  // @ts-expect-error
  bad: true,
});

g.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: g.field({
      type: g.String,
      args: { a: g.arg({ type: g.nonNull(g.Int) }) },
    }),
  },
});

g.object<{ thing: (args: { a: string }) => string }>()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
      args: { a: g.arg({ type: g.nonNull(g.String) }) },
    }),
  },
});

g.object<{ thing: () => string }>()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
      args: { a: g.arg({ type: g.nonNull(g.String) }) },
    }),
  },
});

g.object<{ thing: () => Promise<string> }>()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
    }),
  },
});

{
  // @ts-expect-error
  const thing1: g.NullableInputType = g.list(
    g.object()({
      name: "something",
      fields: {},
    })
  );
  // @ts-expect-error
  const thing2: g.NullableInputType = g.nonNull(
    g.object()({
      name: "something",
      fields: {},
    })
  );
  // @ts-expect-error
  const thing3: g.InputType = g.nonNull(
    g.object()({
      name: "something",
      fields: {},
    })
  );
}

g.object<{}>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: g.field({
      type: g.String,
    }),
  },
});

g.object<{ thing?: string }>()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
    }),
  },
});

g.object<{ thing?: boolean }>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: g.field({
      type: g.String,
    }),
  },
});

g.object<{}>()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: g.field({
      type: g.String,
    }),
  },
});

g.object<{ thing?: undefined }>()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
    }),
  },
});

g.object()({
  name: "Thing",
  fields: {
    // @ts-expect-error
    thing: g.field({
      type: g.String,
      // @ts-expect-error
      resolve() {},
    }),
  },
});

g.object()({
  name: "Thing",
  fields: {
    thing: g.field({
      type: g.String,
      resolve() {
        return undefined;
      },
    }),
  },
});

g.object<any>()({
  name: "Thing",
  fields: {
    thing: g.field({ type: g.String }),
  },
});

{
  type AssetMode = "a" | "b";

  type FileData = {
    mode: AssetMode;
    filename: string;
    filesize: number;
  };

  const fileFields = g.fields<FileData>()({
    filename: g.field({ type: g.nonNull(g.String) }),
    filesize: g.field({ type: g.nonNull(g.Int) }),
    ref: g.field({
      type: g.nonNull(g.String),
      resolve(data) {
        console.log(data);
        return "";
      },
    }),
    src: g.field({
      type: g.nonNull(g.String),
      resolve(data, args, context) {
        console.log(data, args, context);
        return "";
      },
    }),
  });

  const FileFieldOutput = g.interface<FileData>()({
    name: "FileFieldOutput",
    fields: fileFields,
    resolveType: () => "LocalFileFieldOutput",
  });

  g.field({
    type: FileFieldOutput,
    resolve() {
      return undefined as any as FileData;
    },
  });
}

{
  const a = g.field({
    type: g.String,
    resolve() {
      return null;
    },
  });

  g.object()({
    name: "",
    fields: {
      a,
    },
  });
}

{
  const a = g.fields()({
    b: g.field({
      type: g.String,
      resolve() {
        return null;
      },
    }),
  });

  g.object()({
    name: "",
    fields: {
      a: a.b,
    },
  });
}

type Invariant<T> = (t: T) => T;
function assertCompatible<A, _B extends A>() {}

{
  g.field({
    type: g.Int,
    args: {
      blah: g.arg({
        type: Math.random() > 0.5 ? g.nonNull(g.Int) : g.Int,
      }),
    },
    resolve(_, { blah }) {
      assertCompatible<
        Invariant<number | undefined | null>,
        Invariant<typeof blah>
      >();
      return 1;
    },
  });
  g.field({
    type: g.Int,
    args: {
      blah: g.arg({
        type: Math.random() > 0.5 ? g.String : g.Int,
      }),
    },
    resolve(_, { blah }) {
      assertCompatible<
        Invariant<string | number | undefined | null>,
        Invariant<typeof blah>
      >();
      return 1;
    },
  });
  g.field({
    type: g.Int,
    args: {
      blah:
        Math.random() > 0.5
          ? g.arg({
              type: g.nonNull(g.Int),
            })
          : g.arg({
              type: g.Int,
              defaultValue: 1,
            }),
    },
    resolve(_, { blah }) {
      assertCompatible<Invariant<number | null>, Invariant<typeof blah>>();
      return 1;
    },
  });
  g.field({
    type: g.Int,
    args: {
      blah:
        Math.random() > 0.5
          ? g.arg({
              type: g.nonNull(g.Int),
            })
          : Math.random() > 0.5
            ? g.arg({
                type: g.Int,
                defaultValue: 1,
              })
            : g.arg({
                type: g.Int,
              }),
    },
    resolve(_, { blah }) {
      assertCompatible<
        Invariant<number | null | undefined>,
        Invariant<typeof blah>
      >();
      return 1;
    },
  });
}

// just to ensure the old alias works
{
  graphql.object()({
    name: "Query",
    fields: {
      hello: g.field({
        type: g.String,
        resolve() {
          return "something";
        },
      }),
    },
  });
  const Something: graphql.ObjectType<{}> = graphql.object<{}>()({
    name: "Something",
    fields: () => ({
      a: graphql.field({
        type: Something,
        resolve() {
          return {};
        },
      }),
      b: graphql.field({
        type: graphql.String,
        resolve() {
          return "something";
        },
      }),
    }),
  });
}

const someInputFields = {
  a: g.arg({ type: g.String }),
  b: g.arg({ type: g.String }),
};

{
  const Something = g.inputObject({
    name: "Something",
    fields: someInputFields,
    isOneOf: true,
  });
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, true>>,
    Invariant<typeof Something>
  >();
  g.field({
    args: {
      something: g.arg({ type: g.nonNull(Something) }),
    },
    type: g.String,
    resolve(_, { something }) {
      assertCompatible<
        Invariant<
          | {
              readonly a: string;
              readonly b?: undefined;
            }
          | {
              readonly b: string;
              readonly a?: undefined;
            }
        >,
        Invariant<typeof something>
      >();

      return "";
    },
  });
}

{
  const Something = g.inputObject({
    name: "Something",
    fields: someInputFields,
    isOneOf: Math.random() > 0.5,
  });
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, boolean>>,
    Invariant<typeof Something>
  >();
  g.field({
    args: {
      something: g.arg({ type: g.nonNull(Something) }),
    },
    type: g.String,
    resolve(_, { something }) {
      assertCompatible<
        Invariant<
          | {
              readonly a: string | null | undefined;
              readonly b: string | null | undefined;
            }
          | {
              readonly a: string;
              readonly b?: undefined;
            }
          | {
              readonly b: string;
              readonly a?: undefined;
            }
        >,
        Invariant<typeof something>
      >();

      return "";
    },
  });
}

{
  const Something = g.inputObject({
    name: "Something",
    fields: someInputFields,
  });

  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, false>>,
    Invariant<typeof Something>
  >();

  g.field({
    args: {
      something: g.arg({ type: g.nonNull(Something) }),
    },
    type: g.String,
    resolve(_, { something }) {
      assertCompatible<
        Invariant<{
          readonly a: string | null | undefined;
          readonly b: string | null | undefined;
        }>,
        Invariant<typeof something>
      >();

      return "";
    },
  });
}

{
  const Something = g.inputObject({
    name: "Something",
    fields: someInputFields,
    isOneOf: false,
  });

  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, false>>,
    Invariant<typeof Something>
  >();
}

{
  const Something = g.inputObject<typeof someInputFields>({
    name: "Something",
    fields: someInputFields,
  });

  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, false>>,
    Invariant<typeof Something>
  >();
}

{
  g.inputObject<typeof someInputFields, true>(
    // @ts-expect-error
    {
      name: "Something",
      fields: someInputFields,
    }
  );
}

{
  g.inputObject<typeof someInputFields, true>({
    name: "Something",
    fields: someInputFields,
    // @ts-expect-error
    isOneOf: false,
  });
}

{
  g.inputObject<typeof someInputFields, false>({
    name: "Something",
    fields: someInputFields,
    // @ts-expect-error
    isOneOf: true,
  });
}

{
  const Something = g.inputObject<typeof someInputFields, boolean>({
    name: "Something",
    fields: someInputFields,
    isOneOf: true,
  });
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, boolean>>,
    Invariant<typeof Something>
  >();
}

{
  const Something = g.inputObject<typeof someInputFields, boolean>({
    name: "Something",
    fields: someInputFields,
    isOneOf: false,
  });
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, boolean>>,
    Invariant<typeof Something>
  >();
}

{
  const Something = g.inputObject<typeof someInputFields, boolean>({
    name: "Something",
    fields: someInputFields,
    isOneOf: Math.random() > 0.5,
  });
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, boolean>>,
    Invariant<typeof Something>
  >();
}

{
  g.inputObject<typeof someInputFields, boolean>(
    // @ts-expect-error
    {
      name: "Something",
      fields: someInputFields,
    }
  );
}

{
  const Something = g.inputObject({
    name: "Something",
    fields: someInputFields,
    isOneOf: undefined,
  });
  // arguably "bad" that it infers to boolean vs false but this makes no sense to write
  // could be "fixed" by making inputObject do (true extends IsOneOf ? { isOneOf: IsOneOf } : unknown)
  // instead of (true extends IsOneOf ? { isOneOf: unknown } : unknown)
  // but idk, using unknown feels conceptually closer to the behavior i'm going for
  // this would also be banned under exactOptionalPropertyTypes
  // which again feels conceptually correct rather than banning when not using exactOptionalPropertyTypes
  assertCompatible<
    Invariant<g.InputObjectType<typeof someInputFields, boolean>>,
    Invariant<typeof Something>
  >();
}

{
  const A = g.object<{ __typename: "A" }>()({
    name: "A",
    fields: {},
  });

  g.object<{ thing: string }>()({
    name: "Thing",
    fields: {
      thing: g.field({
        type: A,
        resolve(source) {
          assertCompatible<
            Invariant<{ thing: string }>,
            Invariant<typeof source>
          >();
          return { __typename: "A" };
        },
      }),
    },
  });
}

{
  type Thing = {
    something?: string;
  };

  g.object<Thing>()({
    name: "Something",
    fields: {
      something: g.field({
        type: g.String,
        resolve(parent) {
          assertCompatible<Invariant<Thing>, Invariant<typeof parent>>();
          return parent.something;
        },
      }),
    },
  });
}

{
  const a = {
    something: g.field({
      type: g.String,
      args: {
        a: g.arg({ type: g.nonNull(g.String) }),
      },
      resolve() {
        return "something";
      },
    }),
    other: g.field({
      type: g.String,
      args: {
        b: g.arg({ type: g.nonNull(g.String) }),
      },
      // @ts-expect-error
      resolve() {},
    }),
  };
  g.object()({
    name: "Thing",
    // TODO: see if we can remove this error (but the error above should still exist)
    // @ts-expect-error
    fields: {
      ...a,
    },
  });
}

{
  const A = g.object<{
    __typename: "A";
  }>()({
    name: "A",
    fields: {
      something: g.field({
        type: g.nonNull(g.String),
        resolve() {
          return "A";
        },
      }),
    },
  });
  const B = g.object<{
    __typename: "B";
  }>()({
    name: "B",
    fields: {
      something: g.field({
        type: g.nonNull(g.String),
        resolve() {
          return "B";
        },
      }),
    },
  });

  const Something = g.union({
    name: "Something",
    types: [A, B],
  });
  assertCompatible<
    Invariant<
      g.UnionType<
        | {
            __typename: "A";
          }
        | {
            __typename: "B";
          }
      >
    >,
    Invariant<typeof Something>
  >();
  g.field({
    type: Something,
    // @ts-expect-error
    resolve() {
      if (Math.random() > 0.5) {
        return { __typename: "Ad" };
      }
      return { __typename: "B" };
    },
  });
  g.field({
    type: Something,
    args: {
      a: g.arg({ type: g.nonNull(g.String) }),
    },
    resolve(_, args) {
      console.log(args);
      if (Math.random() > 0.5) {
        return { __typename: "A" };
      }
      return { __typename: "B" };
    },
  });
  g.field({
    type: Something,
    args: {
      a: g.arg({ type: g.nonNull(g.String) }),
    },
    async resolve(_, args) {
      console.log(args);
      if (Math.random() > 0.5) {
        return { __typename: "A" };
      }
      return { __typename: "B" };
    },
  });
}
{
  const fields = {
    x: g.arg({ type: g.String }),
  };
  {
    // this error is somewhat unfortunate but it's not a big deal imo
    // what's going on is that InputType includes InputObjectType<any, boolean>
    // so IsOneOf is inferred as boolean
    // which makes the isOneOf property required (though it can be false)
    const a: g.InputType = g.inputObject(
      // @ts-expect-error
      {
        name: "Something",
        fields,
      }
    );
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject({
      name: "Something",
      fields,
      isOneOf: false,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, false>({
      name: "Something",
      fields,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, false>({
      name: "Something",
      fields,
      isOneOf: false,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, true>(
      // @ts-expect-error
      {
        name: "Something",
        fields,
      }
    );
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, true>({
      name: "Something",
      fields,
      isOneOf: true,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject({
      name: "Something",
      fields,
      isOneOf: true,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, true>({
      name: "Something",
      fields,
      // @ts-expect-error
      isOneOf: false,
    });
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, boolean>(
      // @ts-expect-error
      {
        name: "Something",
        fields,
      }
    );
    console.log(a);
  }
  {
    const a: g.InputType = g.inputObject<typeof fields, boolean>({
      name: "Something",
      fields,
      isOneOf: Math.random() > 0.5,
    });
    console.log(a);
  }
}

{
  const nodeFields = g.fields<{ id: string }>()({
    id: g.field({ type: g.ID }),
  });
  const Node = g.interface<{ id: string }>()({
    name: "Node",
    fields: nodeFields,
  });
  const Person = g.object<{
    __typename: "Person";
    id: string;
    name: string;
  }>()({
    name: "Person",
    interfaces: [Node],
    fields: {
      ...nodeFields,
      name: g.field({ type: g.String }),
    },
  });
  console.log(Person);
}

{
  const nodeFields = {
    id: g.field({ type: g.ID }),
  };
  const Node = g.interface<{ id: string }>()({
    name: "Node",
    fields: nodeFields,
  });
  const Person = g.object<{
    __typename: "Person";
    id: string;
    name: string;
  }>()({
    name: "Person",
    interfaces: [Node],
    fields: {
      ...nodeFields,
      name: g.field({ type: g.String }),
    },
  });
  console.log(Person);
}

{
  g.field<unknown, typeof g.String, (arg: unknown) => string, {}>(
    // @ts-expect-error
    { type: g.String }
  );
  g.field<unknown, typeof g.String, undefined, {}>({
    type: g.String,
  });
  g.field<unknown, typeof g.String, (arg: unknown) => string | undefined, {}>(
    // @ts-expect-error
    { type: g.String }
  );
  g.field<unknown, typeof g.String, (arg: unknown) => string, {}>({
    type: g.String,
    resolve() {
      return "";
    },
  });
}

{
  type Something = {
    something: string;
  };

  const Something = g.object<Something>()({
    name: "Something",
    fields: {
      something: g.field({
        type: g.String,
        async resolve(parent) {
          const { something } = parent;
          assertCompatible<
            Invariant<{
              something: string;
            }>,
            Invariant<typeof parent>
          >();
          return something;
        },
      }),
    },
  });
}

{
  type Context = {
    x?: any;
  };

  let discriminantField!: Field<
    { value: unknown },
    Record<string, Arg<InputType, boolean>>,
    OutputType<Context>,
    unknown,
    Context
  >;
  type SourceType = { discriminant: string };

  const g = initG<Context>();

  const interfaceType = g.interface<SourceType>()({
    name: "a",
    fields: () => ({
      discriminant: discriminantField,
    }),
  });

  const field = g.field({
    type: gWithContext.String,
    resolve(x: SourceType) {
      return x.discriminant as string;
    },
  });

  g.object<SourceType>()({
    name: "SomeName",
    interfaces: [interfaceType],
    fields: {
      discriminant: field,
    },
  });
}

{
  assertCompatible<
    Invariant<GScalarType<string, string>>,
    Invariant<GraphQLScalarType<string, string>>
  >();

  assertCompatible<
    Invariant<GObjectType<{ something: string }, { context: "something" }>>,
    Invariant<
      GraphQLObjectType<{ something: string }, { context: "something" }>
    >
  >();

  assertCompatible<
    Invariant<GUnionType<{ something: string }, { context: "something" }>>,
    Invariant<GraphQLUnionType>
  >();

  assertCompatible<
    Invariant<
      GInterfaceType<{ something: string }, any, { context: "something" }>
    >,
    Invariant<GraphQLInterfaceType>
  >();

  assertCompatible<
    Invariant<GEnumType<Record<string, unknown>>>,
    Invariant<GraphQLEnumType>
  >();

  assertCompatible<
    Invariant<GEnumType<{ a: "a"; b: "b" }>>,
    // @ts-expect-error
    Invariant<GraphQLEnumType>
  >();
  assertCompatible<
    GEnumType<{ a: "a"; b: "b" }>,
    // @ts-expect-error
    GraphQLEnumType
  >();
  assertCompatible<GraphQLEnumType, GEnumType<{ a: "a"; b: "b" }>>();

  assertCompatible<
    Invariant<GNonNull<GScalarType<string, string>>>,
    // this error is expected since GNonNull's Symbol.toStringTag getter is more strict than GraphQLNonNull's
    // without this, GNonNull would be assignable to GList which is the stricter getter exists
    // @ts-expect-error
    Invariant<GraphQLNonNull<GScalarType<string, string>>>
  >();
  assertCompatible<
    GraphQLNonNull<GScalarType<string, string>>,
    GNonNull<GScalarType<string, string>>
  >();
  assertCompatible<
    GNonNull<GScalarType<string, string>>,
    // @ts-expect-error
    GraphQLNonNull<GScalarType<string, string>>
  >();

  assertCompatible<
    Invariant<GList<GScalarType<string, string>>>,
    // this error is expected since GNonNull's Symbol.toStringTag getter is more strict than GraphQLNonNull's
    // without this, GNonNull would be assignable to GList which is the stricter getter exists
    // @ts-expect-error
    Invariant<GraphQLList<GScalarType<string, string>>>
  >();
  assertCompatible<
    GraphQLList<GScalarType<string, string>>,
    GList<GScalarType<string, string>>
  >();
  assertCompatible<
    GList<GScalarType<string, string>>,
    // @ts-expect-error
    GraphQLList<GScalarType<string, string>>
  >();

  assertCompatible<
    Invariant<GInputObjectType<Record<string, GArg<any>>, boolean>>,
    Invariant<GraphQLInputObjectType>
  >();

  assertCompatible<
    Invariant<GInputObjectType<Record<string, GArg<GInputType>>, boolean>>,
    // the error essentially ... makes sense due to the non null/list differences
    // @ts-expect-error
    Invariant<GraphQLInputObjectType>
  >();
  assertCompatible<
    GraphQLInputObjectType,
    GInputObjectType<Record<string, GArg<GInputType>>, boolean>
  >();
  assertCompatible<
    GInputObjectType<Record<string, GArg<GInputType>>, boolean>,
    // @ts-expect-error
    GraphQLInputObjectType
  >();

  const x: GInputObjectType<Record<string, GArg<any>>, boolean> = undefined!;

  g.field({
    type: g.String,
    args: {
      a: g.arg({ type: x }),
    },
    resolve(_, args) {
      assertCompatible<
        Invariant<{
          a: { readonly [x: string]: unknown } | null | undefined;
        }>,
        Invariant<typeof args>
      >();
      return "";
    },
  });
}

{
  const a: GEnumType<Record<string, unknown>> = g.enum<{
    a: "a";
    b: "b";
  }>({
    name: "",
    values: g.enumValues(["a", "b"]),
  });
  console.log(a);
  const scalar: GScalarType<string, string> = g.scalar<string>({
    name: "",
    parseValue: () => "",
    parseLiteral: () => "",
  });
  console.log(scalar);
}

{
  const A = g.object<{ __typename: "A"; a: string }>()({
    name: "A",
    fields: {
      a: g.field({ type: g.String }),
    },
  });
  const B = g.object<{ __typename: "B"; b: string }>()({
    name: "B",
    fields: {
      b: g.field({ type: g.String }),
    },
  });

  const Something = new GUnionType<
    { __typename: "A"; a: string } | { __typename: "B"; b: string },
    unknown
  >({
    name: "Something",
    types: [A, B],
  });
  assertCompatible<
    Invariant<
      GUnionType<
        { __typename: "A"; a: string } | { __typename: "B"; b: string },
        unknown
      >
    >,
    Invariant<typeof Something>
  >();
}

{
  const Hex: GScalarType<Uint8Array, string> = undefined as any;
  g.field({
    type: g.Int,
    args: { x: g.arg({ type: Hex }) },
    resolve(_, { x }) {
      assertCompatible<
        Invariant<Uint8Array | null | undefined>,
        Invariant<typeof x>
      >();
      return 1;
    },
  });
  type x = InferValueFromInputType<GNonNull<typeof Hex>>;
  assertCompatible<Invariant<Uint8Array>, Invariant<x>>();
}

{
  type ImpliedResolver<
    Args extends {
      [Key in keyof Args]: Arg<InputType>;
    },
    Type extends OutputType<MyContext<any>>,
    Context extends MyContext<any>,
  > =
    | InferValueFromOutputType<Type>
    | ((
        args: InferValueFromArgs<Args>,
        context: Context,
        info: GraphQLResolveInfo
      ) => InferValueFromOutputType<Type>);

  type MyContext<T> = {
    something: string;
    a: T;
  };
  type SomeTypeThatIsntARecordOfArgs = string;
  const field: <
    Source,
    Type extends OutputType<MyContext<any>>,
    Resolve extends
      | undefined
      | ((
          source: Source,
          args: g.InferValueFromArgs<
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
          >,
          context: Context,
          info: GraphQLResolveInfo
        ) => InferValueFromOutputType<Type>),
    Context extends MyContext<any>,
    Args extends {
      [Key in keyof Args]: Arg<InputType>;
    } = {},
  >(
    field: {
      args?: Args;
      type: Type;
      deprecationReason?: string;
      description?: string;
      extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
    } & (Resolve extends {}
      ? {
          resolve: ((
            source: Source,
            args: InferValueFromArgs<
              SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
            >,
            context: Context,
            info: GraphQLResolveInfo
          ) => InferValueFromOutputType<Type>) &
            Resolve;
        }
      : {
          resolve?: ((
            source: Source,
            args: InferValueFromArgs<
              SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
            >,
            context: Context,
            info: GraphQLResolveInfo
          ) => InferValueFromOutputType<Type>) &
            Resolve;
        })
  ) => Field<
    Source,
    Args,
    Type,
    undefined extends Resolve ? ImpliedResolver<Args, Type, Context> : unknown,
    Context
  > = g.field as any;

  extend((base) => {
    return {
      mutation: {
        publishPost: field({
          type: base.object("Post"),
          args: { id: g.arg({ type: g.nonNull(g.ID) }) },
          resolve(source, args, context: MyContext<{}>) {
            assertCompatible<Invariant<typeof source>, Invariant<unknown>>();
            assertCompatible<
              Invariant<{ id: string }>,
              Invariant<typeof args>
            >();
            console.log(context.something);
            return undefined;
          },
        }),
      },
    };
  });
}

{
  const something: g.InputObjectType<{
    [key: string]: g.Arg<g.InputType>;
  }> = undefined as any;
  const x = Math.random() > 0.5 ? { id: { equals: "1" } } : {};
  const a = g.arg({
    type: g.nonNull(something),
    defaultValue: x,
  });
  assertCompatible<
    Invariant<g.Arg<GNonNull<typeof something>, true>>,
    Invariant<typeof a>
  >();
}
