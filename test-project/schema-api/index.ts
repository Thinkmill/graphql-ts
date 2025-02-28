import {
  InferValueFromArgs,
  InferValueFromOutputType,
} from "@graphql-ts/schema";
import {
  GArg,
  GField,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GNonNull,
  GNullableType,
  GObjectType,
  GOutputType,
  GType,
  GUnionType,
} from "@graphql-ts/schema/definition";
import { GraphQLResolveInfo } from "graphql/type/definition";
export * from "@graphql-ts/schema/api-without-context";
export {
  field,
  fields,
  interface,
  interfaceField,
  object,
  union,
} from "./output-types";

export type Context = unknown;

export type NullableType = GNullableType;
export type Type = GType;
export type NullableOutputType = Exclude<GOutputType<Context>, GNonNull<any>>;
export type OutputType = GOutputType<Context>;
export type Field<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  TType extends OutputType,
  SourceOnField,
> = GField<Source, Args, TType, SourceOnField, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends OutputType,
> = (
  source: Source,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<Type>;
export type ObjectType<Source> = GObjectType<Source, Context>;
export type UnionType<Source> = GUnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    InterfaceField<Record<string, GArg<GInputType>>, OutputType>
  >,
> = GInterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, GArg<GInputType>>,
  TType extends OutputType,
> = GInterfaceField<Args, TType, Context>;
