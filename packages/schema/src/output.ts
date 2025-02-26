import type {
  GraphQLFieldConfigMap,
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLInterfaceTypeExtensions,
  GraphQLIsTypeOfFn,
  GraphQLList,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
  GraphQLType,
} from "graphql/type/definition";
import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
} from "graphql/type/definition";
import type {
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
  Type<any>,
];

/**
 * Any output list type. This type only exists because of limitations in
 * circular types.
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

/** A GraphQL object type which should be created using {@link object `g.object`}. */
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
  Context,
> = (
  source: Source,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<TType>;

/**
 * A GraphQL output field for an {@link ObjectType} which should be created using
 * {@link field `g.field`}.
 */
export type Field<
  Source,
  Args extends Record<string, Arg<InputType>>,
  Type extends OutputType<Context>,
  SourceAtKey,
  Context,
> = {
  args?: Args;
  type: Type;
  resolve?: FieldResolver<Source, Args, Type, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<Source, Context, InferValueFromArgs<Args>>
  >;
  __missingResolve?: (arg: SourceAtKey) => void;
};

export type InterfaceField<
  Args extends Record<string, Arg<InputType>>,
  Type extends OutputType<Context>,
  Context,
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

type ImpliedResolver<
  Args extends { [Key in keyof Args]: Arg<InputType> },
  Type extends OutputType<Context>,
  Context,
> =
  | InferValueFromOutputType<Type>
  | ((
      args: InferValueFromArgs<Args>,
      context: Context,
      info: GraphQLResolveInfo
    ) => InferValueFromOutputType<Type>);

export type FieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: Arg<InputType> },
  Type extends OutputType<Context>,
  Context,
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
};

export type FieldFunc<Context> = <
  Source,
  Type extends OutputType<Context>,
  Resolve extends
    | undefined
    | FieldResolver<
        Source,
        SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
        Type,
        Context
      >,
  Args extends { [Key in keyof Args]: Arg<InputType> } = {},
>(
  field: FieldFuncArgs<Source, Args, Type, Context> & {
    resolve?: Resolve;
  } & (Resolve extends {} ? { resolve: Resolve } : unknown)
) => Field<
  Source,
  Args,
  Type,
  undefined extends Resolve ? ImpliedResolver<Args, Type, Context> : unknown,
  Context
>;

function bindFieldToContext<Context>(): FieldFunc<Context> {
  return function field(field) {
    if (!field.type) {
      throw new Error("A type must be passed to g.field()");
    }
    return field as any;
  };
}

/** @deprecated */
export type InterfaceToInterfaceFields<
  Interface extends InterfaceType<any, any, any>,
> = Interface extends InterfaceType<any, infer Fields, any> ? Fields : never;

type InterfaceFieldsToOutputFields<
  Source,
  Fields extends { [key: string]: InterfaceField<any, any, any> },
> = {
  [Key in keyof Fields]: Fields[Key] extends InterfaceField<
    infer Args,
    infer OutputType,
    infer Context
  >
    ? Field<
        Source,
        Args,
        OutputType,
        Key extends keyof Source ? Source[Key] : unknown,
        Context
      >
    : never;
};

/** @deprecated */
type _InterfacesToOutputFields<
  Source,
  Context,
  Interfaces extends readonly InterfaceType<Source, any, Context>[],
> = InterfacesToOutputFields<Source, Interfaces>;
export type { _InterfacesToOutputFields as InterfacesToOutputFields };

type InterfacesToOutputFields<
  Source,
  Interfaces extends readonly InterfaceType<Source, any, any>[],
> = MergeTuple<
  {
    [Key in keyof Interfaces]: Interfaces[Key] extends InterfaceType<
      Source,
      infer Fields,
      any
    >
      ? InterfaceFieldsToOutputFields<Source, Fields>
      : never;
  },
  {}
>;

type InterfacesToInterfaceFields<
  Interfaces extends readonly InterfaceType<any, any, any>[],
> = MergeTuple<
  {
    [Key in keyof Interfaces]: Interfaces[Key] extends InterfaceType<
      any,
      infer Fields,
      any
    >
      ? Fields
      : never;
  },
  {}
>;

type MergeTuple<T, Merged> = T extends readonly [infer U, ...infer Rest]
  ? MergeTuple<Rest, Merged & U>
  : Merged;

/**
 * Creates a GraphQL object type.
 *
 * See the docs of {@link object `g.object`} for more details.
 */
export type ObjectTypeFunc<Context> = <
  Source,
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      Source,
      any,
      any,
      Key extends keyof Source ? Source[Key] : unknown,
      Context
    >;
  } & InterfaceFieldsToOutputFields<
    Source,
    InterfacesToInterfaceFields<Interfaces>
  >,
  Interfaces extends readonly InterfaceType<Source, any, Context>[] = [],
>(config: {
  name: string;
  fields: Fields | (() => Fields);
  /**
   * A description of the object type that is visible when introspected.
   *
   * ```ts
   * type Person = { name: string };
   *
   * const Person = g.object<Person>()({
   *   name: "Person",
   *   description: "A person does things!",
   *   fields: {
   *     name: g.field({ type: g.String }),
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
   * A number of interfaces that the object type implements. See `g.interface`
   * for more information.
   *
   * ```ts
   * const Node = g.interface<{ kind: string }>()({
   *   name: "Node",
   *   resolveType: (source) => source.kind,
   *   fields: {
   *     id: g.interfaceField({ type: g.ID }),
   *   },
   * });
   *
   * const Person = g.object<{ kind: "Person"; id: string }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     id: g.field({ type: g.ID }),
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
  TObjectType extends ObjectType<any, Context>,
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
  Source,
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends Record<
    string,
    Field<Source, any, OutputType<Context>, any, Context>
  > & {
    [Key in keyof Source]?: Field<
      Source,
      any,
      OutputType<Context>,
      Source[Key],
      Context
    >;
  },
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
  Context,
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
  Args extends { [Key in keyof Args]: Arg<InputType> } = {},
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
  Context,
> = {
  kind: "interface";
  __source: (source: Source) => void;
  __context: (context: Context) => void;
  __fields: Fields;
  graphQLType: GraphQLInterfaceType;
};

export type InterfaceTypeFunc<Context> = <
  Source,
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: InterfaceField<any, OutputType<Context>, Context>;
  } & InterfacesToInterfaceFields<Interfaces>,
  Interfaces extends readonly InterfaceType<Source, any, Context>[] = [],
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
   * `g.inputObject`.
   *
   * When calling `g.object`, you must provide a type parameter that is the
   * source of the object type. The source is what you receive as the first
   * argument of resolvers on this type and what you must return from resolvers
   * of fields that return this type.
   *
   * ```ts
   * const Person = g.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: g.field({ type: g.String }),
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
   * const Person = g.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: g.field({ type: g.String }),
   *     excitedName: g.field({
   *       type: g.String,
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
   * `g.ObjectType<Source>` along with making `fields` a function that returns
   * the object.
   *
   * ```ts
   * type PersonSource = { name: string; friends: PersonSource[] };
   *
   * const Person: g.ObjectType<PersonSource> = g.object<PersonSource>()({
   *   name: "Person",
   *   fields: () => ({
   *     name: g.field({ type: g.String }),
   *     friends: g.field({ type: g.list(Person) }),
   *   }),
   * });
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
   * const A = g.object<{ __typename: "A" }>()({
   *   name: "A",
   *   fields: {
   *     something: g.field({ type: g.String }),
   *   },
   * });
   * const B = g.object<{ __typename: "B" }>()({
   *   name: "B",
   *   fields: {
   *     differentThing: g.field({ type: g.String }),
   *   },
   * });
   * const AOrB = g.union({
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
   * `g.object` call.
   *
   * ```ts
   * const Something = g.object<{ thing: string }>()({
   *   name: "Something",
   *   fields: {
   *     thing: g.field({ type: g.String }),
   *   },
   * });
   * ```
   */
  field: FieldFunc<Context>;
  /**
   * A helper to easily share fields across object and interface types.
   *
   * ```ts
   * const nodeFields = g.fields<{ id: string }>()({
   *   id: g.field({ type: g.ID }),
   * });
   *
   * const Node = g.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = g.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: g.field({ type: g.String }),
   *   },
   * });
   * ```
   *
   * ## Why use `g.fields` instead of just creating an object?
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
   * The `Source` is pretty simple and it's quite simple to see why `g.fields`
   * is useful here. You could explicitly write it with resolvers on the first
   * arg but you'd have to do that on every field which would get very
   * repetitive and wouldn't work for fields without resolvers.
   *
   * ```ts
   * const someFields = g.fields<{ name: string }>()({
   *   name: g.field({ type: g.String }),
   * });
   * ```
   *
   * The `Key` type param might seem a bit more strange though. What it's saying
   * is that _the key that a field is at is part of its TypeScript type_.
   *
   * This is important to be able to represent the fact that a resolver is
   * optional if the `Source` has a property at the `Key` that matches the
   * output type.
   *
   * ```ts
   * // this is allowed
   * const someFields = g.fields<{ name: string }>()({
   *   name: g.field({ type: g.String }),
   * });
   *
   * const someFields = g.fields<{ name: string }>()({
   *   someName: g.field({
   *     // a resolver is required here since the Source is missing a `someName` property
   *     type: g.String,
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
   * {@link interfaceFunc `g.interface`} call. Interfaces fields are similar to
   * {@link Field regular fields} except that they **don't define how the field
   * is resolved**.
   *
   * ```ts
   * const Entity = g.interface()({
   *   name: "Entity",
   *   fields: {
   *     name: g.interfaceField({ type: g.String }),
   *   },
   * });
   * ```
   *
   * Note that {@link Field regular fields} are assignable to
   * {@link InterfaceField interface fields} but the opposite is not true. This
   * means that you can use a regular field in an
   * {@link InterfaceType interface type}.
   */
  interfaceField: InterfaceFieldFunc<Context>;
  /**
   * Creates a GraphQL interface type that can be implemented by other GraphQL
   * object and interface types.
   *
   * ```ts
   * const Entity = g.interface()({
   *   name: "Entity",
   *   fields: {
   *     name: g.interfaceField({ type: g.String }),
   *   },
   * });
   *
   * type PersonSource = { __typename: "Person"; name: string };
   *
   * const Person = g.object<PersonSource>()({
   *   name: "Person",
   *   interfaces: [Entity],
   *   fields: {
   *     name: g.field({ type: g.String }),
   *   },
   * });
   *
   * type OrganisationSource = {
   *   __typename: "Organisation";
   *   name: string;
   * };
   *
   * const Organisation = g.object<OrganisationSource>()({
   *   name: "Organisation",
   *   interfaces: [Entity],
   *   fields: {
   *     name: g.field({ type: g.String }),
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
   * You might have noticed that `g.interfaceField` was used instead of
   * `g.field` for the fields on the interfaces. This is because **interfaces
   * aren't defining implementation of fields** which means that fields on an
   * interface don't need define resolvers.
   *
   * ## Sharing field implementations
   *
   * Even though interfaces don't contain field implementations, you may still
   * want to share field implementations between interface implementations. You
   * can use `g.fields` to do that. See `g.fields` for more information about
   * why you should use `g.fields` instead of just defining an object the fields
   * and spreading that.
   *
   * ```ts
   * const nodeFields = g.fields<{ id: string }>({
   *   id: g.field({ type: g.ID }),
   * });
   *
   * const Node = g.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = g.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: g.field({ type: g.String }),
   *   },
   * });
   * ```
   */
  interface: InterfaceTypeFunc<Context>;
};

export function bindGraphQLSchemaAPIToContext<
  Context,
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
