import {
  GraphQLArgumentConfig,
  GraphQLEnumType,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLScalarType,
} from "graphql/type/definition";
import {
  GArg,
  GEnumType,
  GInputObjectType,
  GInputObjectTypeConfig,
  GInputType,
  GList,
  GNonNull,
  GNullableInputType,
} from "../types";

type InferValueFromNullableInputType<Type extends GInputType> =
  Type extends GraphQLScalarType<infer Value, any>
    ? Value
    : Type extends GraphQLEnumType
      ? Type extends GEnumType<infer Values>
        ? Values[keyof Values]
        : unknown
      : Type extends GList<infer Value extends GInputType>
        ? InferValueFromInputType<Value>[]
        : Type extends GraphQLInputObjectType
          ? Type extends GInputObjectType<infer Fields, infer IsOneOf>
            ? IsOneOf extends true
              ? InferValueForOneOf<Fields>
              : InferValueFromArgs<Fields>
            : Record<string, unknown>
          : never;

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

type InferValueForOneOf<
  T extends { [key: string]: { type: GInputType } },
  Key extends keyof T = keyof T,
> = Flatten<
  Key extends unknown
    ? {
        readonly [K in Key]: InferValueFromNullableInputType<T[K]["type"]>;
      } & {
        readonly [K in Exclude<keyof T, Key>]?: never;
      }
    : never
>;

export type InferValueFromArgs<Args extends Record<string, GArg<GInputType>>> =
  {
    readonly [Key in keyof Args]: InferValueFromArg<Args[Key]>;
  } & {};

export type InferValueFromArg<Arg extends GArg<GInputType>> =
  // the distribution technically only needs to be around the AddUndefined
  // but having it here instead of inside the union
  // means that TypeScript will print the resulting type
  // when you use it rather than keep the alias and
  // the resulting type is generally far more readable
  Arg extends unknown
    ?
        | InferValueFromInputType<Arg["type"]>
        | AddUndefined<Arg["type"], Arg["defaultValue"]>
    : never;

type AddUndefined<TInputType extends GInputType, DefaultValue> =
  TInputType extends GNonNull<any> ? never : DefaultValue & undefined;

export type InferValueFromInputType<Type extends GInputType> =
  Type extends GNonNull<infer Value extends GNullableInputType>
    ? InferValueFromNullableInputType<Value>
    : InferValueFromNullableInputType<Type> | null;

/**
 * Creates a {@link GArg GraphQL argument}.
 *
 * Args can can be used as arguments on output fields:
 *
 * ```ts
 * g.field({
 *   type: g.String,
 *   args: {
 *     something: g.arg({ type: g.String }),
 *   },
 *   resolve(source, { something }) {
 *     return something || somethingElse;
 *   },
 * });
 * // ==
 * graphql`(something: String): String`;
 * ```
 *
 * Or as fields on input objects:
 *
 * ```ts
 * const Something = g.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: g.arg({ type: g.String }),
 *   },
 * });
 * // ==
 * graphql`
 *   input Something {
 *     something: String
 *   }
 * `;
 * ```
 */
export function arg<
  Type extends GInputType,
  DefaultValue extends InferValueFromInputType<Type> | undefined = undefined,
>(
  arg: Flatten<
    {
      type: Type;
    } & Omit<
      GraphQLInputFieldConfig & GraphQLArgumentConfig,
      "type" | "defaultValue"
    >
  > &
    (undefined extends DefaultValue
      ? { defaultValue?: DefaultValue }
      : { defaultValue: DefaultValue })
): GArg<Type, DefaultValue extends undefined ? false : true> {
  if (!arg.type) {
    throw new Error("A type must be passed to g.arg()");
  }
  return arg as any;
}

/**
 * Creates an {@link GInputObjectType input object type}
 *
 * ```ts
 * const Something = g.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: g.arg({ type: g.String }),
 *   },
 * });
 * // ==
 * graphql`
 *   input Something {
 *     something: String
 *   }
 * `;
 * ```
 *
 * ### Handling circular objects
 *
 * Circular input objects require explicitly specifying the fields on the object
 * in the type because of TypeScript's limits with circularity.
 *
 * ```ts
 * type SomethingInputType = g.InputObjectType<{
 *   something: g.Arg<SomethingInputType>;
 * }>;
 * const Something: SomethingInputType = g.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     something: g.arg({ type: Something }),
 *   }),
 * });
 * ```
 *
 * You can specify all of your non-circular fields outside of the fields object
 * and then use `typeof` to get the type to avoid writing the non-circular
 * fields as types again.
 *
 * ```ts
 * const nonCircularFields = {
 *   thing: g.arg({ type: g.String }),
 * };
 * type SomethingInputType = g.InputObjectType<
 *   typeof nonCircularFields & {
 *     something: g.Arg<SomethingInputType>;
 *   }
 * >;
 * const Something: SomethingInputType = g.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     ...nonCircularFields,
 *     something: g.arg({ type: Something }),
 *   }),
 * });
 * ```
 */
export function inputObject<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<GNullableInputType, false>
      : GArg<GInputType>;
  },
  IsOneOf extends boolean = false,
>(
  config: GInputObjectTypeConfig<Fields, IsOneOf>
): GInputObjectType<Fields, IsOneOf> {
  return new GInputObjectType(config);
}
