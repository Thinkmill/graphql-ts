/**
 * `@graphql-ts/schema` is a thin wrapper around
 * [GraphQL.js](https://github.com/graphql/graphql-js) providing type-safety
 * for constructing GraphQL Schemas while avoiding
 * type-generation and [declaration
 * merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
 *
 * ```ts
 * import { schema } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * const Query = schema.object()({
 *   name: "Query",
 *   fields: {
 *     hello: schema.field({
 *       type: schema.String,
 *       resolve() {
 *         return "Hello!";
 *       },
 *     }),
 *   },
 * });
 *
 * const graphQLSchema = new GraphQLSchema({
 *   query: Query.graphQLType,
 * });
 *
 * graphql({
 *   source: `
 *     query {
 *       hello
 *     }
 *   `,
 *   schema: graphQLSchema,
 * }).then((result) => {
 *   console.log(result);
 * });
 * ```
 *
 * @module
 */
export * as schema from "./schema-api";
export { bindSchemaAPIToContext } from "./output";
export type {
  Field,
  FieldFunc,
  FieldResolver,
  FieldsFunc,
  InferValueFromOutputType,
  InterfaceField,
  InterfaceFieldFunc,
  InterfaceToInterfaceFields,
  InterfaceType,
  InterfaceTypeFunc,
  InterfacesToOutputFields,
  NullableOutputType,
  ObjectType,
  ObjectTypeFunc,
  OutputType,
  SchemaAPIWithContext,
  UnionType,
  UnionTypeFunc,
} from "./output";
export type {
  Arg,
  EnumType,
  EnumValue,
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  InputObjectType,
  InputType,
  NullableInputType,
  ListType,
  NonNullType,
  ScalarType,
} from "./api-without-context";
export type { Type, NullableType } from "./type";
