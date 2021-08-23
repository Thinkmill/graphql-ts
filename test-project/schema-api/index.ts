import * as graphqltsSchema from "@graphql-ts/schema";
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

export type NullableType = graphqltsSchema.NullableType<Context>;
export type Type = graphqltsSchema.Type<Context>;
export type NullableOutputType = graphqltsSchema.NullableOutputType<Context>;
export type OutputType = graphqltsSchema.OutputType<Context>;
export type Field<
  RootVal,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType,
  Key extends string
> = graphqltsSchema.Field<RootVal, Args, TType, Key, Context>;
export type FieldResolver<
  RootVal,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType
> = graphqltsSchema.FieldResolver<RootVal, Args, TType, Context>;
export type ObjectType<RootVal> = graphqltsSchema.ObjectType<RootVal, Context>;
export type UnionType<RootVal> = graphqltsSchema.UnionType<RootVal, Context>;
export type InterfaceType<
  RootVal,
  Fields extends Record<
    string,
    graphqltsSchema.InterfaceField<any, OutputType, Context>
  >
> = graphqltsSchema.InterfaceType<RootVal, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType
> = graphqltsSchema.InterfaceField<Args, TType, Context>;
