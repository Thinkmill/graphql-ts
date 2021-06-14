import { GraphQLList, GraphQLNonNull } from "graphql/type/definition";
import { NullableType, Type } from "../type";

export type ListType<Of extends Type<any>> = {
  kind: "list";
  of: Of;
  __context: Of["__context"];
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

/**
 * Wraps any `@ts-gql/schema` GraphQL type in a list.
 *
 * ```ts
 * const stringListType = schema.list(schema.String);
 * // ==
 * graphql`[String]`;
 * ```
 */
export function list<Of extends Type<any>>(of: Of): ListType<Of> {
  return {
    kind: "list",
    of,
    __context: of["__context"],
    graphQLType: new GraphQLList(of.graphQLType),
  };
}

/**
 * Wraps any nullable `@ts-gql/schema` GraphQL type with a non-null type.
 *
 * See the documentation for {@link nonNull `schema.nonNull`} for more information.
 *
 */
export type NonNullType<Of extends NullableType<any>> = {
  kind: "non-null";
  of: Of;
  __context: Of["__context"];
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

/**
 * Wraps any nullable `@ts-gql/schema` GraphQL type with a non-null type.
 *
 * ```ts
 * const nonNullableString = schema.nonNull(schema.String);
 * // ==
 * graphql`String!`;
 * ```
 *
 * When using a non-null type as an input type, your resolver will never recieve
 * null and consumers of your GraphQL API **must** provide a value for it unless
 * you provide a default value.
 *
 * ```ts
 * schema.field({
 *   args: {
 *     someNonNullAndRequiredArg: schema.arg({
 *       type: schema.nonNull(schema.String),
 *     }),
 *     someNonNullButOptionalArg: schema.arg({
 *       type: schema.nonNull(schema.String),
 *       defaultValue: "some default",
 *     }),
 *   },
 *   type: schema.String,
 *   resolve(rootVal, args) {
 *     // both of these will always be a string
 *     args.someNonNullAndRequiredArg;
 *     args.someNonNullButOptionalArg;
 *
 *     return "";
 *   },
 * });
 * // ==
 * graphql`
 *   fieldName(
 *     someNonNullAndRequiredArg: String!
 *     someNonNullButOptionalArg: String! = "some default"
 *   ): String
 * `;
 * ```
 *
 * When using a non-null type as an output type, your resolver must never return
 * null. If you do return null(which unless you do type-casting/ts-ignore/etc.
 * `@ts-gql/schema` will not let you do) graphql-js will return an error to
 * consumers of your GraphQL API.
 *
 * Non-null types should be used very carefully on output types. If you have to
 * do a fallible operation like a network request or etc. to get the value, it
 * probably shouldn't be non-null. If you make a field non-null and doing the
 * fallible operation fails, consumers of your GraphQL API will be unable to see
 * any of the other fields on the object that the non-null field was on. For
 * example, an id on some type is a good candidate for being non-null because if
 * you have the entity, you will already have the id so getting the id will
 * never fail but fetching a related entity from a database would be fallible so
 * even if it will never be null in the success case, you should make it nullable.
 *
 * ```ts
 * schema.field({
 *   type: schema.nonNull(schema.String),
 *   resolve(rootVal, args) {
 *     return "something";
 *   },
 * });
 * // ==
 * graphql`
 *   fieldName: String!
 * `;
 * ```
 *
 * If you try to wrap another non-null type in a non-null type again, you will
 * get a type error.
 *
 * ```ts
 * // Argument of type 'NonNullType<ScalarType<string>>'
 * // is not assignable to parameter of type 'TypesExcludingNonNull'.
 * schema.nonNull(schema.nonNull(schema.String));
 * ```
 */
export function nonNull<Of extends NullableType<any>>(of: Of): NonNullType<Of> {
  return {
    kind: "non-null",
    of,
    __context: of["__context"],
    graphQLType: new GraphQLNonNull(of.graphQLType) as GraphQLNonNull<
      Of["graphQLType"]
    >,
  };
}
