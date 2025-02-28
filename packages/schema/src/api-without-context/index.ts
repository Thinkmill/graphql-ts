export { arg, inputObject } from "./input";
export { Boolean, Float, ID, Int, String, scalar } from "./scalars";
export { list, nonNull } from "./list-and-non-null";
export { enum, enumValues } from "./enum";
export type { InferValueFromOutputType } from "../output";
export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
} from "./input";

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

/** @deprecated Use {@link GEnumType} instead */
export type EnumType<Values extends { [key: string]: unknown }> =
  GEnumType<Values>;
/** @deprecated Use {@link GArg} instead */
export type Arg<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = GArg<Type, HasDefaultValue>;
/** @deprecated Use {@link GList} instead */
export type ListType<Of extends GType<any>> = GList<Of>;
/** @deprecated Use {@link GNonNull} instead */
export type NonNullType<Of extends GNullableType<any>> = GNonNull<Of>;

/** @deprecated Use {@link GScalarType} instead */
export type ScalarType<Internal, External = Internal> = GScalarType<
  Internal,
  External
>;

/** @deprecated Use {@link GInputObjectType} instead */
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
