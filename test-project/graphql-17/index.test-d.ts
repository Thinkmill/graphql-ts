import type {
  GArg,
  GInputObjectType,
  GInterfaceField,
  GInterfaceType,
  GList,
  GNonNull,
  GScalarType,
  GUnionType,
} from "@graphql-ts/schema";
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
