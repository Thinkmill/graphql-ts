import {
  GraphQLEnumType,
  GraphQLEnumTypeExtensions,
} from "graphql/type/definition";

/**
 * An individual enum value in an {@link EnumType enum type} created using
 * {@link enumType `graphql.enum`}. You can use the
 * {@link enumValues `graphql.enumValues`} shorthand to create enum values more easily.
 *
 * Note the value property/generic here represents the deserialized form of the
 * enum. It does not indicate the name of the enum value that is visible in the
 * GraphQL schema. The value can be anything, not necessarily a string. Usually
 * though, it will be a string which is equal to the key where the value is used.
 */
export type EnumValue<Value> = {
  description?: string;
  deprecationReason?: string;
  value: Value;
};

/**
 * A GraphQL enum type which wraps an underlying graphql-js
 * {@link GraphQLEnumType}. This should be created with {@link enumType `graphql.enum`}.
 *
 * ```ts
 * const MyEnum = graphql.enum({
 *   name: "MyEnum",
 *   values: graphql.enumValues(["a", "b"]),
 * });
 * // ==
 * graphql`
 *   enum MyEnum {
 *     a
 *     b
 *   }
 * `;
 * ```
 */
export type EnumType<Values extends Record<string, EnumValue<unknown>>> = {
  kind: "enum";
  values: Values;
  graphQLType: GraphQLEnumType;
  __context: (context: unknown) => void;
};

/**
 * A shorthand to easily create {@link EnumValue enum values} to pass to
 * {@link enumType `graphql.enum`}.
 *
 * If you need to set a `description` or `deprecationReason` for an enum
 * variant, you should pass values directly to `graphql.enum` without using
 * `graphql.enumValues`.
 *
 * ```ts
 * const MyEnum = graphql.enum({
 *   name: "MyEnum",
 *   values: graphql.enumValues(["a", "b"]),
 * });
 * ```
 *
 * ```ts
 * const values = graphql.enumValues(["a", "b"]);
 *
 * assertDeepEqual(values, {
 *   a: { value: "a" },
 *   b: { value: "b" },
 * });
 * ```
 */
export function enumValues<Values extends readonly string[]>(
  values: readonly [...Values]
): Record<Values[number], EnumValue<Values[number]>> {
  return Object.fromEntries(values.map((value) => [value, { value }])) as any;
}

/**
 * Creates an {@link EnumType enum type} with a number of {@link EnumValue enum values}.
 *
 * ```ts
 * const MyEnum = graphql.enum({
 *   name: "MyEnum",
 *   values: graphql.enumValues(["a", "b"]),
 * });
 * // ==
 * graphql`
 *   enum MyEnum {
 *     a
 *     b
 *   }
 * `;
 * ```
 *
 * ```ts
 * const MyEnum = graphql.enum({
 *   name: "MyEnum",
 *   description: "My enum does things",
 *   values: {
 *     something: {
 *       description: "something something",
 *       value: "something",
 *     },
 *     thing: {
 *       description: "thing thing",
 *       deprecationReason: "something should be used instead of thing",
 *       value: "thing",
 *     },
 *   },
 * });
 * // ==
 * graphql`
 *   """
 *   My enum does things
 *   """
 *   enum MyEnum {
 *     """
 *     something something
 *     """
 *     something
 *     """
 *     thing thing
 *     """
 *     thing @deprecated(reason: "something should be used instead of thing")
 *   }
 * `;)
 * ```
 */
function enumType<Values extends Record<string, EnumValue<unknown>>>(config: {
  name: string;
  description?: string;
  extensions?: Readonly<GraphQLEnumTypeExtensions>;
  values: Values;
}): EnumType<Values> {
  const graphQLType = new GraphQLEnumType({
    name: config.name,
    description: config.description,
    extensions: config.extensions,
    values: config.values,
  });
  return {
    kind: "enum",
    values: config.values,
    graphQLType,
    __context: undefined as any,
  };
}

export { enumType as enum };
