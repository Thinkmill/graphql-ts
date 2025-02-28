import { GraphQLScalarTypeConfig } from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";
import { GScalarType } from "../definition";

/**
 * Creates a {@link GScalarType}.
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
 * const JSON = g.scalar<JSONValue>(GraphQLJSON);
 * // for fields on output types
 * g.field({ type: someScalar });
 *
 * // for args on output fields or fields on input types
 * g.arg({ type: someScalar });
 * ```
 */
export function scalar<Internal, External = Internal>(
  config: GraphQLScalarTypeConfig<Internal, External>
): GScalarType<Internal, External> {
  return new GScalarType(config);
}

export const ID = GraphQLID;
export const String = GraphQLString;
export const Float = GraphQLFloat;
export const Int = GraphQLInt;
export const Boolean = GraphQLBoolean;
