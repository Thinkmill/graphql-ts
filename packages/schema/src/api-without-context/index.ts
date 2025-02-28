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

export type EnumType<Values extends { [key: string]: unknown }> =
  GEnumType<Values>;
export { enum, enumValues } from "./enum";

export type Arg<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = GArg<Type, HasDefaultValue>;

export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
} from "./input";

export type InputObjectType<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<GNullableInputType, false>
      : GArg<GInputType>;
  },
  IsOneOf extends boolean = false,
> = GInputObjectType<Fields, IsOneOf>;

export type NullableInputType = GNullableInputType;
export type InputType = GInputType;

export { arg, inputObject } from "./input";
export type ScalarType<Internal, External = Internal> = GScalarType<
  Internal,
  External
>;
export { Boolean, Float, ID, Int, String, scalar } from "./scalars";
export type ListType<Of extends GType<any>> = GList<Of>;

export type NonNullType<Of extends GNullableType<any>> = GNonNull<Of>;

export { list, nonNull } from "./list-and-non-null";
export type { InferValueFromOutputType } from "../output";
