import type * as gInput from "./api-without-context";
import type * as gOutput from "./output";
import type * as gType from "./type";
export { field, object } from "./api-with-context";
export {
  arg,
  Boolean,
  Float,
  ID,
  Int,
  String,
  inputObject,
  list,
  nonNull,
  enum,
  enumValues,
} from "./api-without-context";
export { fields, interface, interfaceField, union } from "./api-with-context";
export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  InferValueFromOutputType,
  InputObjectType,
  InputType,
  ListType,
  NonNullType,
  NullableInputType,
  ScalarType,
  EnumType,
  EnumValue,
  Arg,
} from "./api-without-context";
export { scalar } from "./api-without-context";

/**
 * The particular `Context` type for this `graphql` export that is provided to
 * field resolvers.
 *
 * Below, there are many types exported which are similar to the types with the
 * same names exported from the root of the package except that they are bound
 * to the `Context` type so they can be used elsewhere without needing to be
 * bound to the context on every usage.
 */
export type Context = unknown;

export type NullableType = gType.NullableType<Context>;
export type Type = gType.Type<Context>;
export type NullableOutputType = gOutput.NullableOutputType<Context>;
export type OutputType = gOutput.OutputType<Context>;
export type Field<
  Source,
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType,
  Key extends string
> = gOutput.Field<Source, Args, TType, Key, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType
> = gOutput.FieldResolver<Source, Args, TType, Context>;
export type ObjectType<Source> = gOutput.ObjectType<Source, Context>;
export type UnionType<Source> = gOutput.UnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    gOutput.InterfaceField<
      Record<string, gInput.Arg<gInput.InputType>>,
      OutputType,
      Context
    >
  >
> = gOutput.InterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, gInput.Arg<gInput.InputType>>,
  TType extends OutputType
> = gOutput.InterfaceField<Args, TType, Context>;
