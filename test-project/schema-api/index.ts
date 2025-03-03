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
  Source,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType,
  SourceAtKey,
> = graphqltsSchema.Field<Source, Args, TType, SourceAtKey, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType,
> = graphqltsSchema.FieldResolver<Source, Args, TType, Context>;
export type ObjectType<Source> = graphqltsSchema.ObjectType<Source, Context>;
export type UnionType<Source> = graphqltsSchema.UnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    graphqltsSchema.InterfaceField<any, OutputType, Context>
  >,
> = graphqltsSchema.InterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphqltsSchema.Arg<graphqltsSchema.InputType>>,
  TType extends OutputType,
> = graphqltsSchema.InterfaceField<Args, TType, Context>;
