import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
} from "graphql/type/definition";
import { EnumType } from "./enum";
import { ScalarType } from "./scalars";
import type { NullableOutputType, OutputType } from "../output";
import type { Type } from "../type";
import { ListType, NonNullType } from "..";

export type __toMakeTypeScriptEmitImportsForItemsOnlyUsedInJSDoc = [
  NullableOutputType<any>,
  OutputType<any>,
  Type<any>
];

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
  | ScalarType<any>
  | InputObjectType<any>
  | InputListType
  | EnumType<any>;

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
  // the distribution technically only needs to be around the AddUndefined
  // but having it here instead of inside the union
  // means that TypeScript will print the resulting type
  // when you use it rather than keep the alias and
  // the resulting type is generally far more readable
  TArg extends unknown
    ?
        | InferValueFromInputType<TArg["type"]>
        | AddUndefined<TArg["type"], TArg["__hasDefaultValue"]>
    : never;

type AddUndefined<
  TInputType extends InputType,
  HasDefaultValue extends boolean
> = TInputType extends NonNullType<any>
  ? never
  : HasDefaultValue extends true
  ? never
  : undefined;

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
 * A GraphQL argument. These should be created with {@link arg `graphql.arg`}
 *
 * Args can can be used as arguments on output fields:
 *
 * ```ts
 * graphql.field({
 *   type: graphql.String,
 *   args: {
 *     something: graphql.arg({ type: graphql.String }),
 *   },
 *   resolve(source, { something }) {
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
 * graphql.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: graphql.arg({ type: graphql.String }),
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
 * graphql.field({
 *   type: graphql.String,
 *   args: {
 *     something: graphql.arg({ type: graphql.nonNull(graphql.String) }),
 *   },
 *   resolve(source, { something }) {
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
 * graphql.field({
 *   type: graphql.String,
 *   args: {
 *     something: graphql.arg({ type: graphql.String }),
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
 * const Something = graphql.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: graphql.arg({ type: graphql.String }),
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
    throw new Error("A type must be passed to graphql.arg()");
  }
  return arg as any;
}

/**
 * Creates an {@link InputObjectType}
 *
 * ```ts
 * const Something = graphql.inputObject({
 *   name: "Something",
 *   fields: {
 *     something: graphql.arg({ type: graphql.String }),
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
 * type SomethingInputType = graphql.InputObjectType<{
 *   something: graphql.Arg<SomethingInputType>;
 * }>;
 * const Something: SomethingInputType = graphql.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     something: graphql.arg({ type: Something }),
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
 *   thing: graphql.arg({ type: graphql.String }),
 * };
 * type SomethingInputType = graphql.InputObjectType<
 *   typeof nonCircularFields & {
 *     something: graphql.Arg<SomethingInputType>;
 *   }
 * >;
 * const Something: SomethingInputType = graphql.inputObject({
 *   name: "Something",
 *   fields: () => ({
 *     ...nonCircularFields,
 *     something: graphql.arg({ type: Something }),
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
