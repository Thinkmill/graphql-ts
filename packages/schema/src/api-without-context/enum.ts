import {
  GraphQLEnumType,
  GraphQLEnumTypeExtensions,
} from "graphql/type/definition";

/**
 * An individual enum value in a {@link EnumType `@graphql-ts/schema` enum type}
 * created using {@link enumType `schema.enum`}. You can use the
 * {@link enumValues `schema.enumValues`} shorthand to create enum values more easily.
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
 * An enum type for `@graphql-ts/schema` which wraps an underlying graphql-js
 * `GraphQLEnumType`. This should be created with {@link enumType `schema.enum`}.
 *
 * ```ts
 * const MyEnum = schema.enum({
 *   name: "MyEnum",
 *   values: schema.enumValues(["a", "b"]),
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
export type EnumType<Values extends Record<string, EnumValue<any>>> = {
  kind: "enum";
  values: Values;
  graphQLType: GraphQLEnumType;
  __context: (context: unknown) => void;
};

/**
 * A shorthand to easily create {@link EnumValue enum values} to pass to {@link enumType}.
 *
 * If you need to set a `description` or `deprecationReason` for an enum
 * variant, you should pass values directly to `schema.enum` without using
 * `schema.enumValues`.
 *
 * ```ts
 * const MyEnum = schema.enum({
 *   name: "MyEnum",
 *   values: schema.enumValues(["a", "b"]),
 * });
 * ```
 *
 * ```ts
 * const values = schema.enumValues(["a", "b"]);
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
 * Creates a {@link EnumType `@graphql-ts/schema` enum type} with a number of .
 *
 * ```ts
 * const MyEnum = schema.enum({
 *   name: "MyEnum",
 *   values: schema.enumValues(["a", "b"]),
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
 * const MyEnum = schema.enum({
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
function enumType<Values extends Record<string, EnumValue<any>>>(config: {
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
