/**
 * `@graphql-ts/schema` is a thin wrapper around
 * [GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety for
 * constructing GraphQL Schemas while avoiding type-generation, [declaration
 * merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * and
 * [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html).
 *
 * ```ts
 * import { g } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * const Query = g.object()({
 *   name: "Query",
 *   fields: {
 *     hello: g.field({
 *       type: g.String,
 *       resolve() {
 *         return "Hello!";
 *       },
 *     }),
 *   },
 * });
 *
 * const schema = new GraphQLSchema({
 *   query: Query,
 * });
 *
 * graphql({
 *   source: `
 *     query {
 *       hello
 *     }
 *   `,
 *   schema,
 * }).then((result) => {
 *   console.log(result);
 * });
 * ```
 *
 * @module
 */
export * as g from "./schema-api";
export { initG, type GWithContext } from "./output";

export {
  GObjectType,
  GEnumType,
  GScalarType,
  GInputObjectType,
  GInterfaceType,
  GUnionType,
  GList,
  GNonNull,
  type GArg,
  type GField,
  type GFieldResolver,
  type GInterfaceField,
  type GNullableInputType,
  type GNullableOutputType,
  type GNullableType,
  type GInputType,
  type GOutputType,
  type GType,
} from "./types";
export type { InferValueFromOutputType } from "./output";
export type {
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  Arg,
  EnumType,
  InputObjectType,
  InputType,
  NullableInputType,
  ListType,
  NonNullType,
  ScalarType,
} from "./api-without-context";

import type {
  GArg,
  GField,
  GFieldResolver,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GNullableOutputType,
  GNullableType,
  GObjectType,
  GOutputType,
  GType,
  GUnionType,
} from "./types";

/** @deprecated Use {@link GField} instead */
export type Field<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  SourceAtKey,
  Context,
> = GField<Source, Args, Type, SourceAtKey, Context>;
/** @deprecated Use {@link GFieldResolver} instead */
export type FieldResolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GFieldResolver<Source, Args, Type, Context>;

/** @deprecated Use {@link GInterfaceField} instead */
export type InterfaceField<
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = GInterfaceField<Args, Type, Context>;
/** @deprecated Use {@link GInterfaceType} instead */
export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Context,
> = GInterfaceType<Source, Fields, Context>;
/** @deprecated Use {@link GNullableOutputType} instead */
export type NullableOutputType<Context> = GNullableOutputType<Context>;
/** @deprecated Use {@link GObjectType} instead */
export type ObjectType<Source, Context> = GObjectType<Source, Context>;
/** @deprecated Use {@link GOutputType} instead */
export type OutputType<Context> = GOutputType<Context>;
/** @deprecated Use {@link GUnionType} instead */
export type UnionType<Source, Context> = GUnionType<Source, Context>;
/** @deprecated Use {@link GType} instead */
export type Type<Context> = GType<Context>;
/** @deprecated Use {@link GNullableType} instead */
export type NullableType<Context> = GNullableType<Context>;

export * from "./schema-api-alias";
