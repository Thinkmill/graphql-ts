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

import {
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
} from "@graphql-ts/schema";
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
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

export { scalar } from "@graphql-ts/schema/api-without-context";
