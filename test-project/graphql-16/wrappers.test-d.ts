import type {
  GArg,
  GInputObjectType,
  GInputType,
  GList,
  GNonNull,
  GScalarType,
} from "@graphql-ts/schema";
import type {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";

type Invariant<T> = (value: T) => T;
function assertCompatible<Expected, _Actual extends Expected>() {}

assertCompatible<
  Invariant<GNonNull<GScalarType<string, string>>>,
  // GraphQL 16 wrappers need stricter Symbol.toStringTag types to distinguish lists from non-null types.
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
  // GraphQL 16 wrappers need stricter Symbol.toStringTag types to distinguish lists from non-null types.
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
  // Older GraphQL versions lack the isOneOf property refined by GInputObjectType.
  Invariant<GraphQLInputObjectType & { isOneOf: boolean }>
>();

assertCompatible<
  Invariant<GInputObjectType<Record<string, GArg<GInputType>>, boolean>>,
  // Input fields retain the stricter GNonNull and GList types.
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
