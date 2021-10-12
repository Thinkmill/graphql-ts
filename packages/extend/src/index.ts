/**
 * An API to extend an arbitrary {@link GraphQLSchema} with `@graphql-ts/schema`.
 * Note if you're building a schema entirely with `@graphql-ts/schema`, you
 * shouldn't use this package. This is useful when you have a
 * {@link GraphQLSchema} from somewhere else and you want to some fields to
 * various places in it.
 *
 * See {@link extend} for more details.
 *
 * @module
 */

import { Field, OutputType, graphql, ObjectType } from "@graphql-ts/schema";
import {
  GraphQLSchema,
  isInterfaceType,
  isObjectType,
  isUnionType,
  getNamedType,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  assertValidSchema,
} from "graphql";

/**
 * `extend` allows you to extend a {@link GraphQLSchema} with `@graphql-ts/schema`.
 *
 * ```ts
 * const originalSchema = new GraphQLSchema({ ...etc });
 *
 * const extendedSchema = extend({
 *   query: {
 *     hello: graphql.field({
 *       type: graphql.String,
 *       resolve() {
 *         return "Hello!";
 *       },
 *     }),
 *   },
 * })(originalSchema);
 * ```
 *
 * `extend` will currently throw an error if the query or mutation types are
 * used in other types like this
 *
 * ```graphql
 * type Query {
 *   thing: Query
 * }
 * ```
 */
export function extend(
  _extension: Extension | ((current: BaseSchemaInfo) => Extension)
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) => {
    assertValidSchema(schema);
    const extension =
      typeof _extension === "function"
        ? _extension({
            schema,
            object(name) {
              const graphQLType = schema.getType(name);
              if (graphQLType == null) {
                throw new Error(
                  `Getting the type named ${name} in the schema that is being extended is not possible because no type with that name exists in the schema`
                );
              }
              if (!isObjectType(graphQLType)) {
                throw new Error(
                  `There is a type named ${name} in the schema being extended but it is not an object type`
                );
              }
              return {
                kind: "object",
                __context: () => {},
                __rootVal: undefined as any,
                graphQLType,
              };
            },
          })
        : _extension;
    const queryType = schema.getQueryType()!;
    const mutationType = schema.getMutationType();
    const usages = findObjectTypeUsages(
      schema,
      new Set(mutationType ? [queryType, mutationType] : [queryType])
    );
    if (usages.size) {
      throw new Error(
        `@graphql-ts/extend doesn't yet support using the query and mutation types in other types but\n${[
          ...usages,
        ]
          .map(([type, usages]) => {
            return `- ${type} is used at ${usages.join(", ")}`;
          })
          .join("\n")}`
      );
    }
    if (!extension.mutation && !extension.query) {
      return schema;
    }
    const queryTypeConfig = queryType.toConfig();
    const newQueryType = new GraphQLObjectType({
      ...queryTypeConfig,
      fields: {
        ...queryTypeConfig?.fields,
        ...getGraphQLJSFieldsFromGraphQLTSFields(extension.query || {}),
      },
    });
    const mutationTypeConfig = mutationType?.toConfig();
    const hasExtension = !!Object.entries(extension.mutation || {}).length;
    const newMutationType = hasExtension
      ? new GraphQLObjectType({
          name: "Mutation",
          ...mutationTypeConfig,
          fields: {
            ...mutationTypeConfig?.fields,
            ...getGraphQLJSFieldsFromGraphQLTSFields(extension.mutation!),
          },
        })
      : mutationType;
    const schemaConfig = schema.toConfig();
    let types = [
      ...(queryType ? [] : [newQueryType]),
      ...(mutationType || !newMutationType ? [] : [newMutationType]),
      ...schemaConfig.types.map((type) => {
        if (queryType && type.name === queryType?.name) {
          return newQueryType;
        }
        if (
          newMutationType &&
          mutationType &&
          type.name === mutationType?.name
        ) {
          return newMutationType;
        }
        return type;
      }),
    ];
    const updatedSchema = new GraphQLSchema({
      ...schemaConfig,
      query: newQueryType,
      mutation: newMutationType,
      types,
    });
    assertValidSchema(updatedSchema);
    return updatedSchema;
  };
}

/**
 * Note the distinct usages of `any` vs `unknown` is intentional.
 *
 * - The `unknown` used for the rootVal is because the root val isn't known and it
 *   should generally be used here because these fields are on the query and
 *   mutation types
 * - The first `any` used for the `Args` type parameter is used because `Args` is
 *   invariant so only `Record<string, Arg<InputType, boolean>>` would work with
 *   it. The arguable unsafety here doesn't really matter because people will
 *   always use `graphql.field`
 * - The `any` in `OutputType` and the last type argument ``
 */
type FieldsOnAnything = {
  [key: string]: Field<unknown, any, OutputType<any>, string, any>;
};

/**
 * An extension to a GraphQL schema. This currently only supports adding fields
 * to the query and mutation types. Extending other types will be supported in
 * the future.
 */
export type Extension = {
  /**
   * Extra fields to be added to the query type.
   *
   * ```ts
   * const extension: Extension = {
   *   query: {
   *     isLoggedIn: graphql.field({
   *       type: graphql.Boolean,
   *       resolve(rootVal, args, context, info) {
   *         // ...
   *       },
   *     }),
   *   },
   * };
   * ```
   */
  // Note this is distinct from using `object.Query` because the query
  // type of a schema doesn't have to be named `Query` even though it
  // generally is. By using `query` instead of `object.Query`, these
  // fields will be added to the query type regardless of what it is called.
  query?: FieldsOnAnything;
  /**
   * Extra fields to be added to the mutation type.
   *
   * ```ts
   * const extension: Extension = {
   *   mutation: {
   *     createPost: graphql.field({
   *       type: graphql.Boolean,
   *       resolve(rootVal, args, context, info) {
   *         // ...
   *       },
   *     }),
   *   },
   * };
   * ```
   */
  // Note this is distinct from using `object.Mutation` because the mutation
  // type of a schema doesn't have to be named `Mutation` even though it
  // generally is. By using `mutation` instead of `object.Mutation`, these
  // fields will be added to the mutation type regardless of what it is called.
  mutation?: FieldsOnAnything;
  // /** Extra fields to be added to an abitrary object type */
  // object?: Record<string, FieldsOnAnything<Context>>;
  // /** Extra fields to be added to an abitrary type */
  // inputObject?: Record<string, FieldsOnAnything<Context>>;
  /** Extra variants to add to a */
  // /** If you define an object implementation of an interface but never use the object type */
  //   unreferencedConcreteInterfaceImplementations?: ObjectType<Context, any>[];
};

/**
 * Information about the GraphQL schema that is being extended. Currently this
 * only exposes the {@link GraphQLSchema} object. In the future, this will be
 * extended to allow easily getting a type that exists in the base schema and
 * wrapping it in a `@graphql-ts/schema` type to use in the extension.
 */
export type BaseSchemaInfo = {
  schema: GraphQLSchema;
  /**
   * Gets an object type from the existing GraphQL schema and wraps it in an
   * {@link ObjectType}. If there is no object type in the existing schema with
   * the name passed, an error will be thrown.
   *
   * ```ts
   * const originalSchema = new GraphQLSchema({ ...etc });
   *
   * const extendedSchema = extend((base) => ({
   *   query: {
   *     something: graphql.field({
   *       type: base.object("Something"),
   *       resolve() {
   *         return { something: true };
   *       },
   *     }),
   *   },
   * }))(originalSchema);
   * ```
   *
   * Note that this returns an {@link ObjectType} that allows any root val and
   * any context to be used. If you know what it accepts, you can cast it to the
   * appropriate thing. Arguably this should return `ObjectType<never, never>`
   * to make it clear that it's not known what the required root val and context
   * is which would make it require casting before use.
   */
  object(name: string): ObjectType<unknown, unknown>;
};

function getGraphQLJSFieldsFromGraphQLTSFields(
  fields: Record<string, graphql.Field<any, any, any, any>>
): GraphQLFieldConfigMap<any, any> {
  return graphql
    .object()({
      name: "Something",
      fields,
    })
    .graphQLType.toConfig().fields as GraphQLFieldConfigMap<any, any>;
}

function findObjectTypeUsages(
  schema: GraphQLSchema,
  types: Set<GraphQLObjectType>
) {
  const usages = new Map<GraphQLObjectType, string[]>();
  for (const [name, type] of Object.entries(schema.getTypeMap())) {
    if (isInterfaceType(type) || isObjectType(type)) {
      for (const [fieldName, field] of Object.entries(type.getFields())) {
        const namedType = getNamedType(field.type);
        if (isObjectType(namedType) && types.has(namedType)) {
          getOrDefault(usages, namedType, []).push(`${name}.${fieldName}`);
        }
      }
    }
    if (isUnionType(type)) {
      for (const member of type.getTypes()) {
        if (types.has(member)) {
          getOrDefault(usages, member, [])!.push(name);
        }
      }
    }
  }
  return usages;
}

function getOrDefault<K, V>(input: Map<K, V>, key: K, defaultValue: V): V {
  if (!input.has(key)) {
    input.set(key, defaultValue);
    return defaultValue;
  }
  return input.get(key)!;
}
