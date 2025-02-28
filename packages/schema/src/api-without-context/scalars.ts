import { GraphQLScalarTypeConfig } from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";
import { GScalarType } from "../types";

/**
 * Creates a {@link GScalarType scalar type}.
 *
 * ```ts
 * const BigInt = g.scalar({
 *   name: "BigInt",
 *   serialize(value) {
 *     if (typeof value !== "bigint")
 *       throw new GraphQLError(
 *         `unexpected value provided to BigInt scalar: ${value}`
 *       );
 *     return value.toString();
 *   },
 *   parseLiteral(value) {
 *     if (value.kind !== "StringValue")
 *       throw new GraphQLError("BigInt only accepts values as strings");
 *     return globalThis.BigInt(value.value);
 *   },
 *   parseValue(value) {
 *     if (typeof value === "bigint") return value;
 *     if (typeof value !== "string")
 *       throw new GraphQLError("BigInt only accepts values as strings");
 *     return globalThis.BigInt(value);
 *   },
 * });
 * // for fields on output types
 * g.field({ type: someScalar });
 *
 * // for args on output fields or fields on input types
 * g.arg({ type: someScalar });
 * ```
 *
 * Note, while graphql-js allows you to express scalar types like the `ID` type
 * which accepts integers and strings as both input values and return values
 * from resolvers which are transformed into strings before calling resolvers
 * and returning the query respectively, the type you use should be `string` for
 * `ID` since that is what it is transformed into. `@graphql-ts/schema` doesn't
 * currently express the coercion of scalars, you should instead convert values
 * to the canonical form yourself before returning from resolvers.
 */
export function scalar<Internal, External = Internal>(
  config: GraphQLScalarTypeConfig<Internal, External>
): GScalarType<Internal, External> {
  return new GScalarType(config);
}

export const ID: GScalarType<string> = GraphQLID;
export const String: GScalarType<string> = GraphQLString;
export const Float: GScalarType<number> = GraphQLFloat;
export const Int: GScalarType<number> = GraphQLInt;
export const Boolean: GScalarType<boolean> = GraphQLBoolean;
