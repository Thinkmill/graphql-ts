import {
  GraphQLFieldConfigMap,
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeExtensions,
  GraphQLIsTypeOfFn,
  GraphQLList,
  GraphQLObjectType,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
  GraphQLUnionType,
  GraphQLType,
} from "graphql/type/definition";
import {
  Arg,
  InferValueFromArgs,
  InputType,
  ScalarType,
  EnumType,
  ListType,
  NonNullType,
} from "./api-without-context";
import type { NullableType, Type } from "./type";
import type {
  object,
  field,
  interface as interfaceFunc,
} from "./api-with-context";

export type __toMakeTypeScriptEmitImportsForItemsOnlyUsedInJSDoc = [
  typeof interfaceFunc,
  typeof field,
  typeof object,
  NullableType<any>,
  Type<any>
];

/**
 * Any output list type. This type only exists because of limitations in circular types.
 *
 * If you want to represent any list input type, you should do
 * `ListType<OutputType<Context>>`.
 */
type OutputListType<Context> = {
  kind: "list";
  of: OutputType<Context>;
  graphQLType: GraphQLList<GraphQLType>;
  __context: (context: Context) => void;
};

/**
 * Any nullable GraphQL **output** type for a given `Context`.
 *
 * See also:
 *
 * - {@link NullableType}
 * - {@link InputType}
 * - {@link OutputType}
 */
export type NullableOutputType<Context> =
  | ScalarType<any>
  | ObjectType<any, Context>
  | UnionType<any, Context>
  | InterfaceType<any, any, Context>
  | EnumType<any>
  | OutputListType<Context>;

/**
 * Any GraphQL **output** type for a given `Context`.
 *
 * See also:
 *
 * - {@link Type}
 * - {@link InputType}
 * - {@link NullableOutputType}
 */
export type OutputType<Context> =
  | NullableOutputType<Context>
  | NonNullType<NullableOutputType<Context>>;

type OutputListTypeForInference<Of extends OutputType<any>> = ListType<Of>;

type InferValueFromOutputTypeWithoutAddingNull<Type extends OutputType<any>> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends OutputListTypeForInference<infer Value>
    ? // the `object` bit is here because graphql checks `typeof maybeIterable === 'object'`
      // which means that things like `string` won't be allowed
      // (which is probably a good thing because returning a string from a resolver that needs
      // a graphql list of strings is almost definitely not what you want and if it is, use Array.from)
      // sadly functions that are iterables will be allowed by this type but not allowed by graphql-js
      // (though tbh, i think the chance of that causing problems is quite low)
      object & Iterable<InferValueFromOutputType<Value>>
    : Type extends ObjectType<infer Source, any>
    ? Source
    : Type extends UnionType<infer Source, any>
    ? Source
    : Type extends InterfaceType<infer Source, any, any>
    ? Source
    : never;

type OutputNonNullTypeForInference<Of extends NullableOutputType<any>> =
  NonNullType<Of>;

export type InferValueFromOutputType<Type extends OutputType<any>> =
  MaybePromise<
    Type extends OutputNonNullTypeForInference<infer Value>
      ? InferValueFromOutputTypeWithoutAddingNull<Value>
      : InferValueFromOutputTypeWithoutAddingNull<Type> | null | undefined
  >;

/** A GraphQL object type which should be created using {@link object `graphql.object`}. */
export type ObjectType<Source, Context> = {
  kind: "object";
  graphQLType: GraphQLObjectType;
  __context: (context: Context) => void;
  __source: Source;
};

type MaybePromise<T> = Promise<T> | T;

export type FieldResolver<
  Source,
  Args extends Record<string, Arg<InputType>>,
  TType extends OutputType<Context>,
  Context
> = (
  source: Source,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<TType>;

/**
 * A GraphQL output field for an {@link ObjectType} which should be created using
 * {@link field `graphql.field`}.
 */
export type Field<
  Source,
  Args extends Record<string, Arg<InputType>>,
  TType extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: TType;
  __key: (key: Key) => void;
  __source: (source: Source) => void;
  __context: (context: Context) => void;
  resolve?: FieldResolver<Source, Args, TType, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<Source, Context, InferValueFromArgs<Args>>
  >;
};

export type InterfaceField<
  Args extends Record<string, Arg<InputType>>,
  Type extends OutputType<Context>,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<any, any, InferValueFromArgs<Args>>
  >;
};

type SomeTypeThatIsntARecordOfArgs = string;

type FieldFuncResolve<
  Source,
  Args extends { [Key in keyof Args]: Arg<InputType> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> =
  // the tuple is here because we _don't_ want this to be distributive
  // if this was distributive then it would optional when it should be required e.g.
  // graphql.object<{ id: string } | { id: boolean }>()({
  //   name: "Node",
  //   fields: {
  //     id: graphql.field({
  //       type: graphql.nonNull(graphql.ID),
  //     }),
  //   },
  // });
  [Key] extends [keyof Source]
    ? Source[Key] extends
        | InferValueFromOutputType<Type>
        | ((
            args: InferValueFromArgs<Args>,
            context: Context,
            info: GraphQLResolveInfo
          ) => InferValueFromOutputType<Type>)
      ? {
          resolve?: FieldResolver<
            Source,
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
            Type,
            Context
          >;
        }
      : {
          resolve: FieldResolver<
            Source,
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
            Type,
            Context
          >;
        }
    : {
        resolve: FieldResolver<
          Source,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >;
      };

type FieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: Arg<InputType> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
} & FieldFuncResolve<Source, Args, Type, Key, Context>;

export type FieldFunc<Context> = <
  Source,
  Type extends OutputType<Context>,
  Key extends string,
  Args extends { [Key in keyof Args]: Arg<InputType> } = {}
>(
  field: FieldFuncArgs<Source, Args, Type, Key, Context>
) => Field<Source, Args, Type, Key, Context>;

function bindFieldToContext<Context>(): FieldFunc<Context> {
  return function field(field) {
    if (!field.type) {
      throw new Error("A type must be passed to graphql.field()");
    }
    return field as any;
  };
}

export type InterfaceToInterfaceFields<
  Interface extends InterfaceType<any, any, any>
> = Interface extends InterfaceType<any, infer Fields, any> ? Fields : never;

type InterfaceFieldToOutputField<
  Source,
  Context,
  TField extends InterfaceField<any, any, Context>,
  Key extends string
> = TField extends InterfaceField<infer Args, infer OutputType, Context>
  ? Field<Source, Args, OutputType, Key, Context>
  : never;

type InterfaceFieldsToOutputFields<
  Source,
  Context,
  Fields extends { [Key in keyof Fields]: InterfaceField<any, any, Context> }
> = {
  [Key in keyof Fields]: InterfaceFieldToOutputField<
    Source,
    Context,
    Fields[Key],
    Extract<Key, string>
  >;
};

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

export type InterfacesToOutputFields<
  Source,
  Context,
  Interfaces extends readonly InterfaceType<Source, any, Context>[]
> = UnionToIntersection<
  InterfaceFieldsToOutputFields<
    Source,
    Context,
    InterfaceToInterfaceFields<Interfaces[number]>
  >
>;

/**
 * Creates a GraphQL object type.
 *
 * See the docs of {@link object `graphql.object`} for more details.
 */
export type ObjectTypeFunc<Context> = <
  Source
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      Source,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  } &
    InterfacesToOutputFields<Source, Context, Interfaces>,
  Interfaces extends readonly InterfaceType<Source, any, Context>[] = []
>(config: {
  name: string;
  fields: Fields | (() => Fields);
  /**
   * A description of the object type that is visible when introspected.
   *
   * ```ts
   * type Person = { name: string };
   *
   * const Person = graphql.object<Person>()({
   *   name: "Person",
   *   description: "A person does things!",
   *   fields: {
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   * // ==
   * graphql`
   *   """
   *   A person does things!
   *   """
   *   type Person {
   *     name: String
   *   }
   * `;
   * ```
   */
  description?: string;
  /**
   * A number of interfaces that the object type implements. See
   * `graphql.interface` for more information.
   *
   * ```ts
   * const Node = graphql.interface<{ kind: string }>()({
   *   name: "Node",
   *   resolveType: (source) => source.kind,
   *   fields: {
   *     id: graphql.interfaceField({ type: graphql.ID }),
   *   },
   * });
   *
   * const Person = graphql.object<{ kind: "Person"; id: string }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     id: graphql.field({ type: graphql.ID }),
   *   },
   * });
   * ```
   */
  interfaces?: [...Interfaces];
  isTypeOf?: GraphQLIsTypeOfFn<unknown, Context>;
  extensions?: Readonly<GraphQLObjectTypeExtensions<Source, Context>>;
}) => ObjectType<Source, Context>;

function bindObjectTypeToContext<Context>(): ObjectTypeFunc<Context> {
  return function object() {
    return function objectInner(config) {
      return {
        kind: "object",
        name: config.name,
        graphQLType: new GraphQLObjectType({
          name: config.name,
          description: config.description,
          isTypeOf: config.isTypeOf,
          interfaces: config.interfaces?.map((x) => x.graphQLType),
          fields: () => {
            const fields =
              typeof config.fields === "function"
                ? config.fields()
                : config.fields;
            return buildFields(fields);
          },
          extensions: config.extensions,
        }),
        __source: undefined as any,
        __context: undefined as any,
      };
    };
  };
}

function buildFields(
  fields: Record<
    string,
    Field<any, Record<string, Arg<InputType>>, OutputType<any>, any, any>
  >
): GraphQLFieldConfigMap<any, any> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      key,
      {
        type: val.type.graphQLType as GraphQLOutputType,
        resolve: val.resolve,
        deprecationReason: val.deprecationReason,
        description: val.description,
        args: Object.fromEntries(
          Object.entries(val.args || {}).map(([key, val]) => [
            key,
            {
              type: val.type.graphQLType as GraphQLInputType,
              description: val.description,
              defaultValue: val.defaultValue,
              deprecationReason: val.deprecationReason,
            },
          ])
        ),
        extensions: val.extensions,
      },
    ])
  );
}

export type UnionType<Source, Context> = {
  kind: "union";
  __source: Source;
  __context: (context: Context) => void;
  graphQLType: GraphQLUnionType;
};

export type UnionTypeFunc<Context> = <
  TObjectType extends ObjectType<any, Context>
>(config: {
  name: string;
  description?: string;
  types: TObjectType[];
  resolveType?: (
    type: TObjectType["__source"],
    context: Context,
    info: GraphQLResolveInfo,
    abstractType: GraphQLUnionType
  ) => string;
}) => UnionType<TObjectType["__source"], Context>;

function bindUnionTypeToContext<Context>(): UnionTypeFunc<Context> {
  return function union(config) {
    return {
      kind: "union",
      graphQLType: new GraphQLUnionType({
        name: config.name,
        description: config.description,
        types: config.types.map((x) => x.graphQLType),
        resolveType: config.resolveType as any,
      }),
      __source: undefined as any,
      __context: undefined as any,
    };
  };
}

export type FieldsFunc<Context> = <
  Source
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      Source,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  }
>(
  fields: Fields
) => Fields;

function bindFieldsToContext<Context>(): FieldsFunc<Context> {
  return function fields() {
    return function fieldsInner(fields) {
      return fields;
    };
  };
}

type InterfaceFieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: Arg<InputType> },
  Type extends OutputType<Context>,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
};

export type InterfaceFieldFunc<Context> = <
  Source,
  Type extends OutputType<Context>,
  Args extends { [Key in keyof Args]: Arg<InputType> } = {}
>(
  field: InterfaceFieldFuncArgs<Source, Args, Type, Context>
) => InterfaceField<Args, Type, Context>;

function bindInterfaceFieldToContext<Context>(): InterfaceFieldFunc<Context> {
  return function interfaceField(field) {
    return field as any;
  };
}

export type InterfaceType<
  Source,
  Fields extends Record<
    string,
    InterfaceField<any, OutputType<Context>, Context>
  >,
  Context
> = {
  kind: "interface";
  __source: (source: Source) => void;
  __context: (context: Context) => void;
  __fields: Fields;
  graphQLType: GraphQLInterfaceType;
};

export type InterfaceTypeFunc<Context> = <
  Source
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: InterfaceField<any, OutputType<Context>, Context>;
  } &
    UnionToIntersection<InterfaceToInterfaceFields<Interfaces[number]>>,
  Interfaces extends readonly InterfaceType<Source, any, Context>[] = []
>(config: {
  name: string;
  description?: string;
  deprecationReason?: string;
  interfaces?: [...Interfaces];
  resolveType?: GraphQLTypeResolver<Source, Context>;
  fields: Fields | (() => Fields);
  extensions?: Readonly<GraphQLInterfaceTypeExtensions>;
}) => InterfaceType<Source, Fields, Context>;

function bindInterfaceTypeToContext<Context>(): InterfaceTypeFunc<Context> {
  return function interfaceType() {
    return function interfaceInner(config) {
      return {
        kind: "interface",
        graphQLType: new GraphQLInterfaceType({
          name: config.name,
          description: config.description,
          resolveType: config.resolveType,
          interfaces: config.interfaces?.map((x) => x.graphQLType),
          extensions: config.extensions,
          fields: () => {
            const fields =
              typeof config.fields === "function"
                ? config.fields()
                : config.fields;
            return buildFields(fields as any);
          },
        }),
        __source: undefined as any,
        __context: undefined as any,
        __fields: undefined as any,
      };
    };
  };
}

export type GraphQLSchemaAPIWithContext<Context> = {
  /**
   * Creates a GraphQL object type.
   *
   * Note this is an **output** type, if you want an input object, use
   * `graphql.inputObject`.
   *
   * When calling `graphql.object`, you must provide a type parameter that is
   * the source of the object type. The source is what you receive as the first
   * argument of resolvers on this type and what you must return from resolvers
   * of fields that return this type.
   *
   * ```ts
   * const Person = graphql.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   * // ==
   * graphql`
   *   type Person {
   *     name: String
   *   }
   * `;
   * ```
   *
   * ## Writing resolvers
   *
   * To do anything other than just return a field from the source type, you
   * need to provide a resolver.
   *
   * Note: TypeScript will force you to provide a resolve function if the field
   * in the source type and the GraphQL field don't match
   *
   * ```ts
   * const Person = graphql.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: graphql.field({ type: graphql.String }),
   *     excitedName: graphql.field({
   *       type: graphql.String,
   *       resolve(source, args, context, info) {
   *         return `${source.name}!`;
   *       },
   *     }),
   *   },
   * });
   * ```
   *
   * ## Circularity
   *
   * GraphQL types will often contain references to themselves and to make
   * TypeScript allow that, you need have an explicit type annotation of
   * `graphql.ObjectType<Source>` along with making `fields` a function that
   * returns the object.
   *
   * ```ts
   * type PersonSource = { name: string; friends: PersonSource[] };
   *
   * const Person: graphql.ObjectType<PersonSource> =
   *   graphql.object<PersonSource>()({
   *     name: "Person",
   *     fields: () => ({
   *       name: graphql.field({ type: graphql.String }),
   *       friends: graphql.field({ type: graphql.list(Person) }),
   *     }),
   *   });
   * ```
   */
  object: ObjectTypeFunc<Context>;
  /**
   * Create a GraphQL union type.
   *
   * A union type represents an object that could be one of a list of types.
   * Note it is similar to an {@link InterfaceType} except that a union doesn't
   * imply having a common set of fields among the member types.
   *
   * ```ts
   * const A = graphql.object<{ __typename: "A" }>()({
   *   name: "A",
   *   fields: {
   *     something: graphql.field({ type: graphql.String }),
   *   },
   * });
   * const B = graphql.object<{ __typename: "B" }>()({
   *   name: "B",
   *   fields: {
   *     differentThing: graphql.field({ type: graphql.String }),
   *   },
   * });
   * const AOrB = graphql.union({
   *   name: "AOrB",
   *   types: [A, B],
   * });
   * ```
   */
  union: UnionTypeFunc<Context>;
  /**
   * Creates a GraphQL field.
   *
   * These will generally be passed directly to the `fields` object in a
   * `graphql.object` call.
   *
   * ```ts
   * const Something = graphql.object<{ thing: string }>()({
   *   name: "Something",
   *   fields: {
   *     thing: graphql.field({ type: graphql.String }),
   *   },
   * });
   * ```
   */
  field: FieldFunc<Context>;
  /**
   * A helper to easily share fields across object and interface types.
   *
   * ```ts
   * const nodeFields = graphql.fields<{ id: string }>()({
   *   id: graphql.field({ type: graphql.ID }),
   * });
   *
   * const Node = graphql.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = graphql.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   * ```
   *
   * ## Why use `graphql.fields` instead of just creating an object?
   *
   * The definition of Field in `@graphql-ts/schema` has some special things,
   * let's look at the definition of it:
   *
   * ```ts
   * type Field<
   *   Source,
   *   Args extends Record<string, Arg<InputType>>,
   *   TType extends OutputType<Context>,
   *   Key extends string,
   *   Context
   * > = ...;
   * ```
   *
   * There's two especially notable bits in there which need to be inferred from
   * elsewhere, the `Source` and `Key` type params.
   *
   * The `Source` is pretty simple and it's quite simple to see why
   * `graphql.fields` is useful here. You could explicitly write it with
   * resolvers on the first arg but you'd have to do that on every field which
   * would get very repetitive and wouldn't work for fields without resolvers.
   *
   * ```ts
   * const someFields = graphql.fields<{ name: string }>()({
   *   name: graphql.field({ type: graphql.String }),
   * });
   * ```
   *
   * The `Key` type param might seem a bit more strange though. What it's saying
   * is that *the key that a field is at is part of its TypeScript type*.
   *
   * This is important to be able to represent the fact that a resolver is
   * optional if the `Source` has a property at the `Key` that matches the output type.
   *
   * ```ts
   * // this is allowed
   * const someFields = graphql.fields<{ name: string }>()({
   *   name: graphql.field({ type: graphql.String }),
   * });
   *
   * const someFields = graphql.fields<{ name: string }>()({
   *   someName: graphql.field({
   *     // a resolver is required here since the Source is missing a `someName` property
   *     type: graphql.String,
   *   }),
   * });
   * ```
   *
   * Note that there is no similar function for {@link Arg args} since they don't
   * need special type parameters like {@link Field} does so you can create a
   * regular object and put {@link Arg args} in it if you want to share them.
   */
  fields: FieldsFunc<Context>;
  /**
   * Creates a GraphQL interface field.
   *
   * These will generally be passed directly to `fields` object in a
   * {@link interfaceFunc `graphql.interface`} call. Interfaces fields are
   * similar to {@link Field regular fields} except that they **don't define how
   * the field is resolved**.
   *
   * ```ts
   * const Entity = graphql.interface()({
   *   name: "Entity",
   *   fields: {
   *     name: graphql.interfaceField({ type: graphql.String }),
   *   },
   * });
   * ```
   *
   * Note that {@link Field regular fields} are assignable to
   * {@link InterfaceField interface fields} but the opposite is not true. This
   * means that you can use a regular field in an {@link InterfaceType interface type}.
   */
  interfaceField: InterfaceFieldFunc<Context>;
  /**
   * Creates a GraphQL interface type that can be implemented by other GraphQL
   * object and interface types.
   *
   * ```ts
   * const Entity = graphql.interface()({
   *   name: "Entity",
   *   fields: {
   *     name: graphql.interfaceField({ type: graphql.String }),
   *   },
   * });
   *
   * type PersonSource = { __typename: "Person"; name: string };
   *
   * const Person = graphql.object<PersonSource>()({
   *   name: "Person",
   *   interfaces: [Entity],
   *   fields: {
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   *
   * type OrganisationSource = {
   *   __typename: "Organisation";
   *   name: string;
   * };
   *
   * const Organisation = graphql.object<OrganisationSource>()({
   *   name: "Organisation",
   *   interfaces: [Entity],
   *   fields: {
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   * ```
   *
   * ## Resolving Types
   *
   * When using GraphQL interface and union types, there needs to a way to
   * determine which concrete object type has been returned from a resolver.
   * With `graphql-js` and `@graphql-ts/schema`, this is done with `isTypeOf` on
   * object types and `resolveType` on interface and union types. Note
   * `@graphql-ts/schema` **does not aim to strictly type the implementation of
   * `resolveType` and `isTypeOf`**. If you don't provide `resolveType` or
   * `isTypeOf`, a `__typename` property on the source type will be used, if
   * that fails, an error will be thrown at runtime.
   *
   * ## Fields vs Interface Fields
   *
   * You might have noticed that `graphql.interfaceField` was used instead of
   * `graphql.field` for the fields on the interfaces. This is because
   * **interfaces aren't defining implementation of fields** which means that
   * fields on an interface don't need define resolvers.
   *
   * ## Sharing field implementations
   *
   * Even though interfaces don't contain field implementations, you may still
   * want to share field implementations between interface implementations. You
   * can use `graphql.fields` to do that. See `graphql.fields` for more
   * information about why you should use `graphql.fields` instead of just
   * defining an object the fields and spreading that.
   *
   * ```ts
   * const nodeFields = graphql.fields<{ id: string }>({
   *   id: graphql.field({ type: graphql.ID }),
   * });
   *
   * const Node = graphql.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = graphql.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: graphql.field({ type: graphql.String }),
   *   },
   * });
   * ```
   */
  interface: InterfaceTypeFunc<Context>;
};

export function bindGraphQLSchemaAPIToContext<
  Context
>(): GraphQLSchemaAPIWithContext<Context> {
  return {
    object: bindObjectTypeToContext<Context>(),
    union: bindUnionTypeToContext<Context>(),
    field: bindFieldToContext<Context>(),
    fields: bindFieldsToContext<Context>(),
    interfaceField: bindInterfaceFieldToContext<Context>(),
    interface: bindInterfaceTypeToContext<Context>(),
  };
}
