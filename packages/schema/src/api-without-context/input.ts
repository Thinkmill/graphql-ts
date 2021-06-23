import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
} from "graphql/type/definition";
import { EnumType } from "./enum";
import { ScalarType } from "./scalars";

type InputListTypeForInference<Of extends InputType> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<any>;
  __context: any;
};

type InputNonNullTypeForInference<Of extends NullableInputType> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<any>;
  __context: any;
};

type InputListType = {
  kind: "list";
  of: InputType;
  graphQLType: GraphQLList<any>;
  __context: any;
};

type InputNonNullType = {
  kind: "non-null";
  of: NullableInputType;
  graphQLType: GraphQLNonNull<NullableInputType["graphQLType"]>;
  __context: any;
};

export type NullableInputType =
  | ScalarType<any>
  | InputObjectType<any>
  | InputListType
  | EnumType<any>;

export type InputType = NullableInputType | InputNonNullType;

type InferValueFromInputTypeWithoutAddingNull<Type extends InputType> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends InputListTypeForInference<infer Value>
    ? InferValueFromInputType<Value>[]
    : Type extends InputObjectType<infer Fields>
    ? {
        readonly [Key in keyof Fields]: InferValueFromArg<Fields[Key]>;
      }
    : never;

export type InferValueFromArgs<Args extends Record<string, Arg<any, any>>> = {
  readonly [Key in keyof Args]: InferValueFromArg<Args[Key]>;
};

export type InferValueFromArg<TArg extends Arg<any, any>> =
  | InferValueFromInputType<TArg["type"]>
  | ("non-null" extends TArg["type"]["kind"]
      ? never
      : undefined extends TArg["defaultValue"]
      ? undefined
      : never);

export type InferValueFromInputType<Type extends InputType> =
  Type extends InputNonNullTypeForInference<infer Value>
    ? InferValueFromInputTypeWithoutAddingNull<Value>
    : InferValueFromInputTypeWithoutAddingNull<Type> | null;

export type InputObjectType<
  Fields extends {
    [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType>>;
  }
> = {
  kind: "input";
  __fields: Fields;
  __context: (context: unknown) => void;
  graphQLType: GraphQLInputObjectType;
};

/**
 * A `@ts-gql/schema` GraphQL argument. These should be created with
 * {@link arg `schema.arg`}
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
 * ```
 */
export type Arg<
  Type extends InputType,
  DefaultValue extends InferValueFromInputType<Type> | undefined =
    | InferValueFromInputType<Type>
    | undefined
> = {
  type: Type;
  description?: string;
  deprecationReason?: string;
  defaultValue: DefaultValue;
};

/**
 * Creates a {@link Arg `@ts-gql/schema` GraphQL argument}.
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
): Arg<Type, DefaultValue> {
  if (!arg.type) {
    throw new Error("A type must be passed to schema.arg()");
  }
  return arg as any;
}

export function inputObject<
  Fields extends {
    [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType>>;
  }
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

// type Thing<T extends string | undefined> = {
//   something?: string;
//   theThing: T;
// };

// function thing<B extends string | undefined = undefined>(
//   arg: { something: string,a: } & (T extends undefined
//     ? { defaultValue?: undefined }
//     : { defaultValue: B })
// ): Thing<B> {
//   return undefined as any;
// }

// const x = thing({
//   something: "",
//   defaultValue: Math.random() > 0.5 ? "" : undefined,
//   ...(Math.random() > 0.5 ? {} : { defaultValue: "" }),
// });
