/**
 * @module
 * @deprecated This entrypoint should no longer be used. Use {@link initG}
 *   instead.
 */
import { initG } from "@graphql-ts/schema";
const {
  arg,
  inputObject,
  Boolean,
  Float,
  ID,
  Int,
  String,
  list,
  nonNull,
  enum: enumType,
  enumValues,
  scalar,
} = initG<unknown>();
export {
  arg,
  inputObject,
  Boolean,
  Float,
  ID,
  Int,
  String,
  list,
  nonNull,
  enumType as enum,
  enumValues,
  scalar,
};
export type {
  InferValueFromOutputType,
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
} from "../types";

import type {
  GArg,
  GEnumType,
  GInputObjectType,
  GInputType,
  GList,
  GNonNull,
  GNullableInputType,
  GNullableType,
  GScalarType,
  GType,
} from "../types";

/**
 * @deprecated Use {@link GEnumType} or {@link enumType `g<typeof g.enum<...>>`}
 *   instead
 */
export type EnumType<Values extends { [key: string]: unknown }> =
  GEnumType<Values>;
/** @deprecated Use {@link GArg} or {@link arg `g<typeof g.arg<...>>`} instead */
export type Arg<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = GArg<Type, HasDefaultValue>;
/** @deprecated Use {@link GList} or {@link list `g<typeof g.list<...>>`} instead */
export type ListType<Of extends GType<any>> = GList<Of>;
/**
 * @deprecated Use {@link GNonNull} or {@link nonNull `g<typeof g.nonNull<...>>`}
 *   instead
 */
export type NonNullType<Of extends GNullableType<any>> = GNonNull<Of>;

/**
 * @deprecated Use {@link GScalarType} or {@link scalar `g<typeof g.scalar<...>>`}
 *   instead
 */
export type ScalarType<Internal, External = Internal> = GScalarType<
  Internal,
  External
>;

/**
 * @deprecated Use {@link GInputObjectType} or
 *   {@link inputObject `g<typeof g.inputObject<...>>`} instead
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
