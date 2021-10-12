/**
 * An API to extend an arbitrary {@link GraphQLSchema} with `@graphql-ts/schema`.
 * Note if you're building a schema entirely with `@graphql-ts/schema`, you
 * shouldn't use this package. This is useful when you have a
 * {@link GraphQLSchema} from somewhere else and you want to some fields to
 * various places in it.
 *
 * See {@link extend} for more details.
 */

import { Field, OutputType, graphql } from "@graphql-ts/schema";
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

type FieldsOnAnything<Context> = Record<
  string,
  Field<unknown, any, OutputType<Context>, string, Context>
>;

type CurrentSchemaInfo = {
  schema: GraphQLSchema;
};

type Extension<Context> = {
  /**
   * Extra fields to be added to the query type.
   *
   * ```ts
   * const extension: Extension<Context> = {
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
  query?: FieldsOnAnything<Context>;
  /**
   * Extra fields to be added to the mutation type.
   *
   * ```ts
   * const extension: Extension<Context> = {
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
  mutation?: FieldsOnAnything<Context>;
  // /** Extra fields to be added to an abitrary object type */
  // object?: Record<string, FieldsOnAnything<Context>>;
  // /** Extra fields to be added to an abitrary type */
  // inputObject?: Record<string, FieldsOnAnything<Context>>;
  /** Extra variants to add to a */
  // /** If you define an object implementation of an interface but never use the object type */
  //   unreferencedConcreteInterfaceImplementations?: ObjectType<Context, any>[];
};

export function extend(
  _extension:
    | Extension<unknown>
    | ((current: CurrentSchemaInfo) => Extension<unknown>)
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) => {
    assertValidSchema(schema);
    const extension =
      typeof _extension === "function" ? _extension({ schema }) : _extension;
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
