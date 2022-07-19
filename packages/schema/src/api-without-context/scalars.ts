import { GraphQLScalarType } from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";

/**
 * A GraphQL scalar type which wraps an underlying graphql-js
 * `GraphQLScalarType` with a type representing the deserialized form of the
 * scalar. These should be created used {@link scalar `graphql.scalar`}.
 *
 * ```ts
 * const someScalar = graphql.scalar<string>(new GraphQLScalarType({}));
 *
 * // for fields on output types
 * graphql.field({ type: someScalar });
 *
 * // for args on output fields or fields on input types
 * graphql.arg({ type: someScalar });
 * ```
 */
export type ScalarType<Type extends {}> = {
  kind: "scalar";
  graphQLType: GraphQLScalarType<Type, unknown> & {
    serialize: (value: Type) => unknown;
  };
};

/**
 * Creates a {@link ScalarType} from a graphql-js {@link GraphQLScalarType}.
 *
 * You should provide a type as a type parameter which is the type of the scalar
 * value. Note, while graphql-js allows you to express scalar types like the
 * `ID` type which accepts integers and strings as both input values and return
 * values from resolvers which are transformed into strings before calling
 * resolvers and returning the query respectively, the type you use should be
 * `string` for `ID` since that is what it is transformed into.
 * `@graphql-ts/schema` doesn't currently express the coercion of scalars, you
 * should instead convert values to the canonical form yourself before returning
 * from resolvers.
 *
 * ```ts
 * const JSON = graphql.scalar<JSONValue>(GraphQLJSON);
 * // for fields on output types
 * graphql.field({ type: someScalar });
 *
 * // for args on output fields or fields on input types
 * graphql.arg({ type: someScalar });
 * ```
 */
export function scalar<Type extends {}>(
  scalar: GraphQLScalarType
): ScalarType<Type> {
  return {
    kind: "scalar",
    graphQLType: scalar as ScalarType<Type>["graphQLType"],
  };
}

export const ID: ScalarType<string> = scalar<string>(GraphQLID);
export const String: ScalarType<string> = scalar<string>(GraphQLString);
export const Float: ScalarType<number> = scalar<number>(GraphQLFloat);
export const Int: ScalarType<number> = scalar<number>(GraphQLInt);
export const Boolean: ScalarType<boolean> = scalar<boolean>(GraphQLBoolean);
