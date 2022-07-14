/**
 * Utilties to wrap named `graphql-js` types into `@graphql-ts/schema` types.
 * Note that when using these functions, you're not provided with a lot of the
 * guarantees that `@graphql-ts/schema` will normally provide since the values
 * passed in don't include the necessary type information. These functions
 * return GraphQL types that accept/can be used as any type and can be used with
 * any context. If you know more specific types for the GraphQL types, you
 * should cast them with `as`.
 *
 * @module
 */

import type {
  ObjectType,
  InputObjectType,
  EnumType,
  EnumValue,
  Arg,
  InputType,
  UnionType,
  InterfaceType,
  InterfaceField,
  OutputType,
  ScalarType,
} from ".";
import type {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";

/**
 * Wraps an existing {@link GraphQLObjectType} into a {@link ObjectType} so that
 * it can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someObjectType = new GraphQLObjectType({ ...etc });
 *
 * graphql.field({
 *   type: wrap.object(someObjectType),
 *   resolve() {
 *     // ...
 *   },
 * });
 * ```
 */
export function object(
  graphQLType: GraphQLObjectType
): ObjectType<unknown, unknown> {
  return {
    kind: "object",
    graphQLType,
    __context: undefined as any,
    __source: undefined as any,
  };
}

/**
 * Wraps an existing {@link GraphQLInputObjectType} into a {@link InputObjectType}
 * so that it can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someInputObjectType = new GraphQLInputObjectType({ ...etc });
 *
 * graphql.field({
 *   type: graphql.String,
 *   args: {
 *     something: graphql.arg({ type: someInputObjectType }),
 *   },
 *   resolve(source, { something }) {
 *     console.log(something);
 *     // ...
 *   },
 * });
 * ```
 */
export function inputObject(
  graphQLType: GraphQLInputObjectType
): InputObjectType<{ [key: string]: Arg<InputType, boolean> }> {
  return {
    kind: "input",
    __context: undefined as any,
    __fields: undefined as any,
    graphQLType,
  };
}

/**
 * Wraps an existing {@link GraphQLEnumType} into a {@link EnumType} so that it
 * can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someEnumType = new GraphQLEnumType({ ...etc });
 *
 * graphql.field({
 *   type: wrap.enum(someEnumType),
 *   args: {
 *     something: graphql.arg({ type: wrap.enum(someEnumType) }),
 *   },
 *   resolve(source, { something }) {
 *     console.log(something);
 *     // ...
 *   },
 * });
 * ```
 */
function enumType(
  graphQLType: GraphQLEnumType
): EnumType<Record<string, EnumValue<unknown>>> {
  return {
    kind: "enum",
    __context: undefined as any,
    graphQLType,
    values: Object.fromEntries(
      graphQLType.getValues().map((value): [string, EnumValue<unknown>] => [
        value.name,
        {
          value: value.value,
          deprecationReason: value.deprecationReason ?? undefined,
          description: value.description ?? undefined,
        },
      ])
    ),
  };
}

export { enumType as enum };

/**
 * Wraps an existing {@link GraphQLUnionType} into a {@link UnionType} so that it
 * can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someUnionType = new GraphQLUnionType({ ...etc });
 *
 * graphql.field({
 *   type: wrap.union(someUnionType),
 *   resolve() {
 *     // ...
 *   },
 * });
 * ```
 */
export function union(
  graphQLType: GraphQLUnionType
): UnionType<unknown, unknown> {
  return {
    kind: "union",
    __context: undefined as any,
    __source: undefined as any,
    graphQLType,
  };
}

/**
 * Wraps an existing {@link GraphQLInterfaceType} into a {@link InterfaceType} so
 * that it can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someInterfaceType = new GraphQLInterfaceType({ ...etc });
 *
 * graphql.field({
 *   type: wrap.interface(someInterfaceType),
 *   resolve() {
 *     // ...
 *   },
 * });
 * ```
 */
function interfaceType(
  graphQLType: GraphQLInterfaceType
): InterfaceType<
  unknown,
  Record<string, InterfaceField<any, OutputType<unknown>, unknown>>,
  unknown
> {
  return {
    kind: "interface",
    __context: undefined as any,
    __source: undefined as any,
    __fields: undefined as any,
    graphQLType,
  };
}

export { interfaceType as interface };

/**
 * Wraps an existing {@link GraphQLScalarType} into a {@link ScalarType} so that
 * it can be used in a GraphQL schema built with `@graphql-ts/schema`.
 *
 * ```ts
 * // this will likely be obtained from some existing GraphQLSchema
 * const someInterfaceType = new GraphQLScalarType({ ...etc });
 *
 * graphql.field({
 *   type: wrap.interface(someInterfaceType),
 *   resolve() {
 *     // ...
 *   },
 * });
 * ```
 *
 * You should provide a type as a type parameter which is the type of the scalar
 * value. Note, while graphql-js allows you to express scalar types like the
 * `ID` type which accepts integers and strings as both input values and return
 * values from resolvers which are transformed into strings before calling
 * resolvers and returning the query respectively, the type you use should be
 * `string` for `ID` since that is what it is transformed into.
 * `@graphql-ts/schema` doesn't currently express the coercion of scalars. To
 * workaround this, you can convert values to the canonical form before
 * returning from resolvers.
 *
 * ```ts
 * const JSON = graphql.scalar(GraphQLJSON) as ScalarType<JSONValue>;
 * // for fields on output types
 * graphql.field({ type: someScalar });
 *
 * // for args on output fields or fields on input types
 * graphql.arg({ type: someScalar });
 * ```
 */
export function scalar(scalar: GraphQLScalarType): ScalarType<unknown> {
  return {
    kind: "scalar",
    __type: undefined as any,
    __context: undefined as any,
    graphQLType: scalar,
  };
}
