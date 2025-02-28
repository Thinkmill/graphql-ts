import { GEnumType, GEnumTypeConfig, GEnumValueConfig } from "../definition";

/**
 * A shorthand to easily create {@link GEnumValueConfig enum values} to pass to
 * {@link enumType `g.enum`}.
 *
 * If you need to set a `description` or `deprecationReason` for an enum
 * variant, you should pass values directly to `g.enum` without using
 * `g.enumValues`.
 *
 * ```ts
 * const MyEnum = g.enum({
 *   name: "MyEnum",
 *   values: g.enumValues(["a", "b"]),
 * });
 * ```
 *
 * ```ts
 * const values = g.enumValues(["a", "b"]);
 *
 * assertDeepEqual(values, {
 *   a: { value: "a" },
 *   b: { value: "b" },
 * });
 * ```
 */
export function enumValues<const Values extends readonly string[]>(
  values: readonly [...Values]
): {
  [Key in Values[number]]: GEnumValueConfig<Key>;
} {
  return Object.fromEntries(values.map((value) => [value, { value }])) as any;
}

/**
 * Creates an {@link GEnumType enum type} with a number of
 * {@link GEnumValueConfig enum values}.
 *
 * ```ts
 * const MyEnum = g.enum({
 *   name: "MyEnum",
 *   values: g.enumValues(["a", "b"]),
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
 * const MyEnum = g.enum({
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
 *     thing @\deprecated(reason: "something should be used instead of thing")
 *   }
 * `;)
 * ```
 */
function enumType<Values extends Record<string, unknown>>(
  config: GEnumTypeConfig<Values>
): GEnumType<Values> {
  return new GEnumType(config);
}

export { enumType as enum };
