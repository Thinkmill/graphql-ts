import type {
  GArg,
  GEnumType,
  GField,
  GFieldResolver,
  GInputObjectType,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GList,
  GNonNull,
  GNullableInputType,
  GNullableOutputType,
  GNullableType,
  GObjectType,
  GOutputType,
  GScalarType,
  GType,
  GUnionType,
  InferValueFromInputType as _InferValueFromInputType,
  InferValueFromArgs as _InferValueFromArgs,
  InferValueFromOutputType as _InferValueFromOutputType,
  InferValueFromArg as _InferValueFromArg,
} from "./types";

import { gWithContext } from "./output";

/**
 * @deprecated Use {@link gWithContext} to bind `g` to a specific context instead
 *   of this generic `g`
 */
export const g = gWithContext<g.Context>();
export type g<T> = gWithContext.infer<T>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace g {
  export type Context = unknown;
  /**
   * @deprecated Use {@link GEnumType} or {@link g.enum `g<typeof g.enum<...>>`}
   *   instead
   */
  export type EnumType<Values extends { [key: string]: unknown }> =
    GEnumType<Values>;
  /** @deprecated Use {@link GArg} or {@link g.arg `g<typeof g.arg<...>>`} instead */
  export type Arg<
    Type extends GInputType,
    HasDefaultValue extends boolean = boolean,
  > = GArg<Type, HasDefaultValue>;
  /**
   * @deprecated Use {@link GList} or {@link g.list `g<typeof g.list<...>>`}
   *   instead
   */
  export type ListType<Of extends GType<any>> = GList<Of>;
  /**
   * @deprecated Use {@link GNonNull} or
   *   {@link g.nonNull `g<typeof g.nonNull<...>>`} instead
   */
  export type NonNullType<Of extends GNullableType<any>> = GNonNull<Of>;

  /**
   * @deprecated Use {@link GScalarType} or
   *   {@link g.scalar `g<typeof g.scalar<...>>`} instead
   */
  export type ScalarType<Internal, External = Internal> = GScalarType<
    Internal,
    External
  >;

  /**
   * @deprecated Use {@link GInputObjectType} or
   *   {@link g.inputObject `g<typeof g.inputObject<...>>`} instead
   */
  export type InputObjectType<
    Fields extends {
      [key: string]: IsOneOf extends true
        ? GArg<GNullableInputType, false>
        : GArg<GInputType>;
    },
    IsOneOf extends boolean = false,
  > = GInputObjectType<Fields, IsOneOf>;
  /** @deprecated Use {@link GNullableInputType} instead */
  export type NullableInputType = GNullableInputType;
  /** @deprecated Use {@link GInputType} instead */
  export type InputType = GInputType;

  /** @deprecated Use {@link GNullableType} instead. */
  export type NullableType = GNullableType<Context>;
  /** @deprecated Use {@link GType} instead. */
  export type Type = GType<Context>;
  /** @deprecated Use {@link GNullableOutputType} instead. */
  export type NullableOutputType = GNullableOutputType<Context>;
  /** @deprecated Use {@link GOutputType} instead. */
  export type OutputType = GOutputType<Context>;
  /** @deprecated Use {@link GField} instead. */
  export type Field<
    Source,
    Args extends Record<string, GArg<GInputType>>,
    TType extends GOutputType<Context>,
    SourceAtKey,
  > = GField<Source, Args, TType, SourceAtKey, Context>;
  /** @deprecated Use {@link GFieldResolver} instead. */
  export type FieldResolver<
    Source,
    Args extends Record<string, GArg<GInputType>>,
    TType extends GOutputType<Context>,
  > = GFieldResolver<Source, Args, TType, Context>;
  /**
   * @deprecated Use {@link GObjectType} or
   *   {@link object `g<typeof g.object<...>`} instead.
   */
  export type ObjectType<Source> = GObjectType<Source, Context>;
  /**
   * @deprecated Use {@link GUnionType} or {@link g.union `g<typeof g.union<...>`}
   *   instead.
   */
  export type UnionType<Source> = GUnionType<Source, Context>;
  /** @deprecated Use {@link GInterfaceType} instead. */
  export type InterfaceType<
    Source,
    Fields extends Record<
      string,
      GInterfaceField<Record<string, GArg<GInputType>>, OutputType, Context>
    >,
  > = GInterfaceType<Source, Fields, Context>;
  /**
   * @deprecated Use {@link GInterfaceField} or
   *   {@link g.interfaceField `g<typeof g.interfaceField<...>`} instead.
   */
  export type InterfaceField<
    Args extends Record<string, GArg<GInputType>>,
    TType extends GOutputType<Context>,
  > = GInterfaceField<Args, TType, Context>;

  /** @deprecated Use {@link _InferValueFromArg `InferValueFromArg`} instead. */
  export type InferValueFromArg<Arg extends GArg<GInputType>> =
    _InferValueFromArg<Arg>;

  /** @deprecated Use {@link _InferValueFromArgs `InferValueFromArgs`} instead. */
  export type InferValueFromArgs<Arg extends Record<string, GArg<GInputType>>> =
    _InferValueFromArgs<Arg>;

  /**
   * @deprecated Use {@link _InferValueFromInputType `InferValueFromInputType`}
   *   instead.
   */
  export type InferValueFromInputType<InputType extends GInputType> =
    _InferValueFromInputType<InputType>;

  /**
   * @deprecated Use {@link _InferValueFromOutputType `InferValueFromOutputType`}
   *   instead.
   */
  export type InferValueFromOutputType<OutputType extends GOutputType<any>> =
    _InferValueFromOutputType<OutputType>;
}
