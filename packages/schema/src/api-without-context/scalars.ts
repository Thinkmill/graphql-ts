import { ValueNode } from "graphql/language/ast";
import {
  GraphQLScalarType,
  GraphQLScalarTypeExtensions,
} from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";
import { scalar as wrapScalar } from "../wrap";

/**
 * A GraphQL scalar type which wraps a {@link GraphQLScalarType} with a type
 * representing the deserialized form of the scalar. These should be created
 * used {@link scalar `graphql.scalar`}.
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
export type ScalarType<Type> = {
  kind: "scalar";
  __type: Type;
  __context: (context: unknown) => void;
  graphQLType: GraphQLScalarType;
};

/**
 * Creates an {@link ScalarType}. Note if you have a {@link GraphQLScalarType} and
 * you want to wrap it in a {@link ScalarType} so it can be used with
 * `@graphql-ts/schema`, you should use {@link wrapScalar `wrap.scalar`}.
 *
 * ```ts
 * const JSON = graphql.scalar({
 *   name: "JSON",
 *   description: string,
 *   serialize: (value) => value,
 *   parseValue: (value) => value,
 *   parseLiteral: (node) => {
 *     // ...
 *   },
 *   specifiedByURL:
 *     "http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf",
 * });
 *
 * // for fields on output types
 * graphql.field({ type: JSON });
 *
 * // for args on output fields or fields on input types
 * graphql.arg({ type: JSON });
 * ```
 */
export function scalar<Type>(config: {
  name: string;
  description?: string;
  serialize: (value: Type) => unknown;
  parseValue: (value: unknown) => Type;
  parseLiteral: (valueNode: ValueNode) => Type;
  specifiedByURL?: string;
  extensions?: Readonly<GraphQLScalarTypeExtensions>;
}): ScalarType<Type> {
  return wrapScalar(
    new GraphQLScalarType({
      name: config.name,
      description: config.description,
      specifiedByURL: config.specifiedByURL,
      serialize: config.serialize as any,
      parseValue: config.parseValue,
      parseLiteral: config.parseLiteral,
      extensions: config.extensions,
    })
  ) as ScalarType<Type>;
}

export const ID = wrapScalar(GraphQLID) as ScalarType<string>;
export const String = wrapScalar(GraphQLString) as ScalarType<string>;
export const Float = wrapScalar(GraphQLFloat) as ScalarType<number>;
export const Int = wrapScalar(GraphQLInt) as ScalarType<number>;
export const Boolean = wrapScalar(GraphQLBoolean) as ScalarType<boolean>;
