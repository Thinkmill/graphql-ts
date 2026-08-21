import type {
  GArg,
  GInputObjectType,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GList,
  GNonNull,
  GScalarType,
  GUnionType,
  InferExternalValueFromInputType,
  InferValueFromArg,
} from "@graphql-ts/schema";
import { gWithContext } from "@graphql-ts/schema";
import type {
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLUnionType,
} from "graphql";

type Invariant<T> = (value: T) => T;
function assertCompatible<Expected, _Actual extends Expected>() {}

type Source = { id: string };
type Context = { requestId: string };
type Scalar = GScalarType<string, string>;

assertCompatible<
  Invariant<GraphQLUnionType<Source, Context>>,
  Invariant<GUnionType<Source, Context>>
>();
assertCompatible<
  Invariant<GraphQLInterfaceType<Source, Context>>,
  Invariant<GInterfaceType<Source, any, Context>>
>();
assertCompatible<
  Invariant<GraphQLNonNull<Scalar>>,
  Invariant<GNonNull<Scalar>>
>();
assertCompatible<Invariant<GraphQLList<Scalar>>, Invariant<GList<Scalar>>>();
assertCompatible<
  Invariant<GraphQLInputObjectType>,
  Invariant<GInputObjectType<Record<string, GArg<any>>, boolean>>
>();

type InterfaceFields = {
  id: GInterfaceField<{}, Scalar, Context>;
};
type PreciseInterface = GInterfaceType<Source, InterfaceFields, Context>;
assertCompatible<GraphQLInterfaceType<Source, Context>, PreciseInterface>();
assertCompatible<
  PreciseInterface,
  // @ts-expect-error precise interface fields are GraphQL-TS-only information
  GraphQLInterfaceType<Source, Context>
>();

const g = gWithContext<unknown>();

assertCompatible<
  Invariant<unknown>,
  Invariant<InferExternalValueFromInputType<any>>
>();
assertCompatible<
  Invariant<unknown>,
  Invariant<InferExternalValueFromInputType<GInputType>>
>();

// Broad input object types must not recursively expand untyped list elements.
const untypedInput = undefined! as GInputObjectType<
  Record<string, GArg<any>>,
  boolean
>;
g.arg({ type: untypedInput });
g.arg({ type: untypedInput, default: { value: { anything: [1, "two"] } } });

const broadInput = undefined! as GInputObjectType<
  Record<string, GArg<GInputType>>
>;
g.arg({ type: broadInput, default: { value: { anything: [1, "two"] } } });

type InternalAndExternalScalar = GScalarType<number, string>;
const internalAndExternalScalar = undefined! as InternalAndExternalScalar;
assertCompatible<
  Invariant<string | null>,
  Invariant<InferExternalValueFromInputType<InternalAndExternalScalar>>
>();

const argWithDefault = g.arg({
  type: g.String,
  default: { value: "external input" },
});
assertCompatible<
  Invariant<GArg<typeof g.String, true>>,
  Invariant<typeof argWithDefault>
>();

g.arg<typeof g.String, undefined, { value: string }>({
  type: g.String,
  default: { value: "external input" },
});

// @ts-expect-error explicitly selecting a default type requires default
g.arg<typeof g.String, undefined, { value: string }>({
  type: g.String,
});
assertCompatible<
  Invariant<string | null>,
  Invariant<InferValueFromArg<typeof argWithDefault>>
>();

const mode = g.enum({
  name: "Mode",
  values: { FAST: { value: 42 } },
});
g.arg({ type: mode, default: { value: "FAST" } });
g.arg({
  type: mode,
  // @ts-expect-error native enum defaults use names, not internal values
  default: { value: 42 },
});
g.arg({
  type: mode,
  // @ts-expect-error native enum defaults must name a defined enum value
  default: { value: "UNKNOWN" },
});

g.arg({
  type: internalAndExternalScalar,
  default: { value: "external input" },
});
g.arg({
  type: internalAndExternalScalar,
  // @ts-expect-error native defaults use the scalar's external value type
  default: { value: 1 },
});
g.arg({
  type: g.Int,
  // @ts-expect-error native defaults must use the input type's value type
  default: { value: "not a number" },
});

const argWithLiteralDefault = g.arg({
  type: g.String,
  default: { literal: { kind: "StringValue", value: "literal input" } },
});
assertCompatible<
  Invariant<GArg<typeof g.String, true>>,
  Invariant<typeof argWithLiteralDefault>
>();

const argWithUndefinedDefault = g.arg({
  type: g.String,
  default: undefined,
});
assertCompatible<
  Invariant<GArg<typeof g.String, false>>,
  Invariant<typeof argWithUndefinedDefault>
>();

const argWithBothDefaults = g.arg({
  type: g.String,
  defaultValue: "legacy",
  default: { value: "external input" },
});
assertCompatible<
  Invariant<GArg<typeof g.String, true>>,
  Invariant<typeof argWithBothDefaults>
>();

const maybeDefault =
  Math.random() > 0.5 ? { default: { value: "external input" } } : {};
const argWithMaybeDefault = g.arg({
  type: g.String,
  ...maybeDefault,
});
assertCompatible<
  Invariant<GArg<typeof g.String, boolean>>,
  Invariant<typeof argWithMaybeDefault>
>();

g.arg({
  type: g.String,
  // @ts-expect-error GraphQLDefaultInput requires exactly one of value or literal
  default: {},
});

const optionalFieldsInput = g.inputObject({
  name: "OptionalFieldsInput",
  fields: {
    label: g.arg({ type: g.String }),
    limit: g.arg({ type: g.nonNull(g.Int), defaultValue: 10 }),
    offset: g.arg({ type: g.nonNull(g.Int), default: { value: 0 } }),
    description: g.arg({ type: g.String, default: { value: "default" } }),
  },
});
assertCompatible<
  Invariant<{
    readonly label?: string | null | undefined;
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
    readonly description?: string | null | undefined;
  } | null>,
  Invariant<InferExternalValueFromInputType<typeof optionalFieldsInput>>
>();
g.arg({ type: optionalFieldsInput, default: { value: {} } });
g.arg({
  type: optionalFieldsInput,
  default: { value: { label: undefined, limit: undefined } },
});
g.arg({
  type: optionalFieldsInput,
  // @ts-expect-error a default does not allow null for a non-null field
  default: { value: { limit: null } },
});

const requiredFieldsInput = g.inputObject({
  name: "RequiredFieldsInput",
  fields: {
    name: g.arg({ type: g.nonNull(g.String) }),
    options: g.arg({ type: optionalFieldsInput }),
  },
});
g.arg({ type: requiredFieldsInput, default: { value: { name: "name" } } });
g.arg({
  type: requiredFieldsInput,
  default: { value: { name: "name", options: {} } },
});
g.arg({
  type: requiredFieldsInput,
  // @ts-expect-error non-null fields without defaults must be supplied
  default: { value: {} },
});

const oneOfInput = g.inputObject({
  name: "OneOfInput",
  isOneOf: true,
  fields: {
    name: g.arg({ type: g.String }),
    options: g.arg({ type: optionalFieldsInput }),
  },
});
g.arg({ type: oneOfInput, default: { value: { options: {} } } });
g.arg({
  type: oneOfInput,
  // @ts-expect-error one-of inputs still require exactly one field
  default: { value: {} },
});
g.arg({
  type: oneOfInput,
  // @ts-expect-error a selected one-of field cannot be null
  default: { value: { name: null } },
});

const intList = g.list(g.Int);
assertCompatible<
  Invariant<number | (object & Iterable<number | null>) | null>,
  Invariant<InferExternalValueFromInputType<typeof intList>>
>();
const singletonDefault = g.arg({ type: intList, default: { value: 1 } });
assertCompatible<
  Invariant<(number | null)[] | null>,
  Invariant<InferValueFromArg<typeof singletonDefault>>
>();
g.arg({ type: intList, default: { value: [1, null] as const } });
g.arg({ type: intList, default: { value: new Set([1, 2]) } });
g.arg({
  type: intList,
  // @ts-expect-error iterable elements must match the input type
  default: { value: new Set(["wrong"]) },
});
g.arg({ type: intList, default: { value: null } });
g.arg({ type: g.list(g.list(g.Int)), default: { value: 1 } });
g.arg({ type: g.list(g.list(g.Int)), default: { value: [1, [2]] } });
g.arg({ type: g.list(optionalFieldsInput), default: { value: {} } });
g.arg({
  type: intList,
  // @ts-expect-error singleton inputs must still match the element type
  default: { value: "not a number" },
});
g.arg({
  type: g.nonNull(intList),
  // @ts-expect-error nullable elements do not make the list itself nullable
  default: { value: null },
});
g.arg({
  type: g.list(g.nonNull(g.Int)),
  // @ts-expect-error non-null list elements cannot be null
  default: { value: [null] },
});

const resolvedFields = optionalFieldsInput.getFields();
assertCompatible<
  Invariant<string | null | undefined>,
  Invariant<InferValueFromArg<typeof resolvedFields.label>>
>();
assertCompatible<
  Invariant<string | null>,
  Invariant<InferValueFromArg<typeof resolvedFields.description>>
>();
const reusedInput = g.inputObject({
  name: "ReusedInput",
  fields: resolvedFields,
});
g.arg({ type: reusedInput, default: { value: {} } });

type UncertainDefaultArg = {
  type: typeof g.String;
  defaultValue?: undefined;
  default?: { value: string };
};
assertCompatible<
  Invariant<string | null | undefined>,
  Invariant<InferValueFromArg<UncertainDefaultArg>>
>();
