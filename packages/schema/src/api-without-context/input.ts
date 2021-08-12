import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
} from "graphql/type/definition";
import { EnumType, EnumValue } from "./enum";
import { ScalarType } from "./scalars";
// (these are referenced in the docs)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NullableOutputType, OutputType } from "../output";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Type } from "../type";
import { ListType, NonNullType } from "..";

/**
 * Any input list type. This type only exists because of limitations in circular types.
 *
 * If you want to represent any list input type, you should do `ListType<InputType>`.
 */
type InputListType = {
  kind: "list";
  of: InputType;
  graphQLType: GraphQLList<any>;
  __context: any;
};

/**
 * Any nullable GraphQL **input** type.
 *
 * Note that this is not generic over a `Context` like
 * {@link NullableOutputType `NullableOutputType`} is because inputs types never
 * interact with the `Context`.
 *
 * See also:
 *
 * - {@link InputType}
 * - {@link Type}
 * - {@link OutputType}
 */
export type NullableInputType =
  | ScalarType<unknown>
  | InputObjectType<{ [key: string]: Arg<InputType, boolean> }>
  | InputListType
  | EnumType<Record<string, EnumValue<unknown>>>;

type X = Arg<InputType>;

type Y = InferValueFromArg<X>;

/**
 * Any GraphQL **input** type.
 *
 * Note that this is not generic over a `Context` like {@link OutputType} is
 * because inputs types never interact with the `Context`.
 *
 * See also:
 *
 * - {@link NullableInputType}
 * - {@link Type}
 * - {@link OutputType}
 */
export type InputType = NullableInputType | NonNullType<NullableInputType>;

type InputListTypeForInference<Of extends InputType> = ListType<Of>;

type InferValueFromInputTypeWithoutAddingNull<Type extends InputType> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends InputListTypeForInference<infer Value>
    ? InferValueFromInputType<Value>[]
    : Type extends InputObjectType<infer Fields>
    ? InferValueFromArgs<Fields>
    : never;

export type InferValueFromArgs<Args extends Record<string, Arg<InputType>>> = {
  readonly [Key in keyof Args]: InferValueFromArg<Args[Key]>;
};

export type InferValueFromArg<TArg extends Arg<InputType>> =
  | InferValueFromInputType<TArg["type"]>
  | ("non-null" extends TArg["type"]["kind"]
      ? never
      : TArg["__hasDefaultValue"] extends true
      ? never
      : undefined);

type InputNonNullTypeForInference<Of extends NullableInputType> =
  NonNullType<Of>;

export type InferValueFromInputType<Type extends InputType> =
  Type extends InputNonNullTypeForInference<infer Value>
    ? InferValueFromInputTypeWithoutAddingNull<Value>
    : InferValueFromInputTypeWithoutAddingNull<Type> | null;

export type InputObjectType<Fields extends { [key: string]: Arg<InputType> }> =
  {
    kind: "input";
    __fields: Fields;
    __context: (context: unknown) => void;
    graphQLType: GraphQLInputObjectType;
  };

/**
 * A GraphQL argument. These should be created with {@link arg `schema.arg`}
 *
 * Args can can be used as arguments on output fields:
 *
 * ```ts
 * schema.field({
 *   type: schema.String,
 *   args: {
 *     something: schema.arg({ type: schema.String }),
 *   },
 *   resolve(rootVal, { something }) {
 *     return something || somethingElse;
 *   },
 * });
 * // ==
 * graphql`fieldName(something: String): String`;
 * ```
 *
 * Or as fields on input objects:
 *
 * ```ts
 * schema.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: schema.arg({ type: schema.String }),
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
 * When the type of an arg is {@link NonNullType non-null}, the value will always exist.
 *
 * ```ts
 * schema.field({
 *   type: schema.String,
 *   args: {
 *     something: schema.arg({ type: schema.nonNull(schema.String) }),
 *   },
 *   resolve(rootVal, { something }) {
 *     // `something` will always be a string
 *     return something;
 *   },
 * });
 * // ==
 * graphql`fieldName(something: String!): String`;
 * ```
 */
export type Arg<
  Type extends InputType,
  HasDefaultValue extends boolean = boolean
> = {
  type: Type;
  description?: string;
  deprecationReason?: string;
  __hasDefaultValue: HasDefaultValue;
  defaultValue: unknown;
};

/**
 * Creates a {@link Arg GraphQL argument}.
 *
 * Args can can be used as arguments on output fields:
 *
 * ```ts
 * schema.field({
 *   type: schema.String,
 *   args: {
 *     something: schema.arg({ type: schema.String }),
 *   },
 *   resolve(rootVal, { something }) {
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
 * const Something = schema.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: schema.arg({ type: schema.String }),
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
  Type extends InputType,
  DefaultValue extends InferValueFromInputType<Type> | undefined = undefined
>(
  arg: {
    type: Type;
    description?: string;
    deprecationReason?: string;
  } & (DefaultValue extends undefined
    ? { defaultValue?: DefaultValue }
    : { defaultValue: DefaultValue })
): Arg<Type, DefaultValue extends undefined ? false : true> {
  if (!arg.type) {
    throw new Error("A type must be passed to schema.arg()");
  }
  return arg as any;
}

/**
 * Creates an {@link InputObjectType}
 *
 * ```ts
 * const Something = schema.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: schema.arg({ type: schema.String }),
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
 * const Something: schema.InputObjectType<{
 *   something: schema.Arg<Something>;
 * }> = schema.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     something: schema.arg({ type: Something }),
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
 *   thing: schema.arg({ type: schema.String }),
 * };
 *
 * const Something: schema.InputObjectType<
 *   typeof nonCircularFields & {
 *     something: schema.Arg<typeof Something>;
 *   }
 * > = schema.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     something: schema.arg({ type: Something }),
 *     ...nonCircularFields,
 *   }),
 * });
 * ```
 */
export function inputObject<
  Fields extends { [key: string]: Arg<InputType> }
>(config: {
  name: string;
  description?: string;
  fields: (() => Fields) | Fields;
}): InputObjectType<Fields> {
  const fields = config.fields;
  const graphQLType = new GraphQLInputObjectType({
    name: config.name,
    description: config.description,
    fields: () => {
      return Object.fromEntries(
        Object.entries(typeof fields === "function" ? fields() : fields).map(
          ([key, value]) =>
            [
              key,
              {
                description: value.description,
                type: value.type.graphQLType as GraphQLInputType,
                defaultValue: value.defaultValue,
                deprecationReason: value.deprecationReason,
              },
            ] as const
        )
      );
    },
  });
  return {
    kind: "input",
    __fields: undefined as any,
    __context: undefined as any,
    graphQLType,
  };
}
