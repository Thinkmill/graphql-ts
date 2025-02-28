import type {
  GraphQLEnumType,
  GraphQLFieldExtensions,
  GraphQLObjectTypeConfig,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
} from "graphql/type/definition";
import type { InferValueFromArgs } from "./api-without-context";
import type {
  object,
  field,
  interface as interfaceFunc,
} from "./api-with-context";
import {
  GArg,
  GEnumType,
  GField,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GInterfaceTypeConfig,
  GList,
  GNonNull,
  GNullableOutputType,
  GObjectType,
  GOutputType,
  GUnionType,
} from "./types";

export type __toMakeTypeScriptEmitImportsForItemsOnlyUsedInJSDoc = [
  typeof interfaceFunc,
  typeof field,
  typeof object,
];

type InferValueFromOutputTypeWithoutAddingNull<Type extends GraphQLOutputType> =
  Type extends GraphQLScalarType<infer Value>
    ? Value
    : Type extends GraphQLEnumType
      ? Type extends GEnumType<infer Values>
        ? Values[keyof Values]
        : never
      : Type extends GList<infer Value extends GOutputType<any>>
        ? // the `object` bit is here because graphql checks `typeof maybeIterable === 'object'`
          // which means that things like `string` won't be allowed
          // (which is probably a good thing because returning a string from a resolver that needs
          // a graphql list of strings is almost definitely not what you want and if it is, use Array.from)
          // sadly functions that are iterables will be allowed by this type but not allowed by graphql-js
          // (though tbh, i think the chance of that causing problems is quite low)
          object & Iterable<InferValueFromOutputType<Value>>
        : Type extends GraphQLObjectType<infer Source, any>
          ? Source
          : Type extends GraphQLUnionType | GraphQLInterfaceType
            ? Type extends
                | GUnionType<infer Source, any>
                | GInterfaceType<infer Source, any, any>
              ? Source
              : unknown
            : never;

export type InferValueFromOutputType<Type extends GOutputType<any>> =
  MaybePromise<
    Type extends GNonNull<infer Value extends GNullableOutputType<any>>
      ? InferValueFromOutputTypeWithoutAddingNull<Value>
      : InferValueFromOutputTypeWithoutAddingNull<Type> | null | undefined
  >;

type MaybePromise<T> = Promise<T> | T;

type SomeTypeThatIsntARecordOfArgs = string;

type ImpliedResolver<
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  Context,
> =
  | InferValueFromOutputType<Type>
  | ((
      args: InferValueFromArgs<Args>,
      context: Context,
      info: GraphQLResolveInfo
    ) => InferValueFromOutputType<Type>);

type FieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  Context,
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
};

/** @deprecated */
export type InterfaceToInterfaceFields<
  Interface extends GInterfaceType<any, any, any>,
> = Interface extends GInterfaceType<any, infer Fields, any> ? Fields : never;

type InterfaceFieldsToOutputFields<
  Source,
  Context,
  Fields extends { [key: string]: GInterfaceField<any, any, any> },
> = {
  [Key in keyof Fields]: Fields[Key] extends GInterfaceField<
    infer Args,
    infer OutputType,
    any
  >
    ? GField<
        Source,
        Args,
        OutputType,
        Key extends keyof Source ? Source[Key] : unknown,
        Context
      >
    : never;
};

/** @deprecated */
export type _InterfacesToOutputFields<
  Source,
  Context,
  Interfaces extends readonly GInterfaceType<Source, any, Context>[],
> = InterfacesToOutputFields<Source, Context, Interfaces>;
export type { _InterfacesToOutputFields as InterfacesToOutputFields };

type InterfacesToOutputFields<
  Source,
  Context,
  Interfaces extends readonly GInterfaceType<Source, any, any>[],
> = MergeTuple<
  {
    [Key in keyof Interfaces]: Interfaces[Key] extends GInterfaceType<
      Source,
      infer Fields,
      any
    >
      ? InterfaceFieldsToOutputFields<Source, Context, Fields>
      : never;
  },
  {}
>;

export type InterfacesToInterfaceFields<
  Interfaces extends readonly GInterfaceType<any, any, any>[],
> = MergeTuple<
  {
    [Key in keyof Interfaces]: Interfaces[Key] extends GInterfaceType<
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

type InterfaceFieldFuncArgs<
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  Context,
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<any, Context>>;
};

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
  object: <
    Source,
  >(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
    youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
  }) => <
    Fields extends {
      [Key in keyof Fields]: GField<
        Source,
        any,
        any,
        Key extends keyof Source ? Source[Key] : unknown,
        Context
      >;
    } & InterfaceFieldsToOutputFields<
      Source,
      Context,
      InterfacesToInterfaceFields<Interfaces>
    >,
    const Interfaces extends readonly GInterfaceType<
      Source,
      any,
      Context
    >[] = [],
  >(
    config: {
      fields: Fields | (() => Fields);
      interfaces?: [...Interfaces];
    } & Omit<GraphQLObjectTypeConfig<Source, Context>, "fields" | "interfaces">
  ) => GObjectType<Source, Context>;
  /**
   * Create a GraphQL union type.
   *
   * A union type represents an object that could be one of a list of types.
   * Note it is similar to an {@link GInterfaceType interface type} except that a
   * union doesn't imply having a common set of fields among the member types.
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
  union: <Type extends GObjectType<any, Context>>(
    config: Flatten<
      Omit<
        GraphQLUnionTypeConfig<
          Type extends GObjectType<infer Source, Context> ? Source : never,
          Context
        >,
        "types"
      > & {
        types: readonly Type[] | (() => readonly Type[]);
      }
    >
  ) => GUnionType<
    Type extends GObjectType<infer Source, Context> ? Source : never,
    Context
  >;
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
  field: <
    Source,
    Type extends GOutputType<Context>,
    Resolve,
    Args extends { [Key in keyof Args]: GArg<GInputType> } = {},
  >(
    field: FieldFuncArgs<Source, Args, Type, Context> &
      (Resolve extends {}
        ? {
            resolve: ((
              source: Source,
              args: InferValueFromArgs<
                SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
              >,
              context: Context,
              info: GraphQLResolveInfo
            ) => InferValueFromOutputType<Type>) &
              Resolve;
          }
        : {
            resolve?: ((
              source: Source,
              args: InferValueFromArgs<
                SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
              >,
              context: Context,
              info: GraphQLResolveInfo
            ) => InferValueFromOutputType<Type>) &
              Resolve;
          })
  ) => GField<
    Source,
    Args,
    Type,
    Resolve extends {} ? unknown : ImpliedResolver<Args, Type, Context>,
    Context
  >;
  /**
   * A helper to declare fields while providing the source type a single time
   * rather than in every resolver.
   *
   * ```ts
   * const nodeFields = g.fields<{ id: string }>()({
   *   id: g.field({ type: g.ID }),
   *   relatedIds: g.field({
   *     type: g.list(g.ID),
   *     resolve(source) {
   *       return loadRelatedIds(source.id);
   *     },
   *   }),
   *   otherRelatedIds: g.field({
   *     type: g.list(g.ID),
   *     resolve(source) {
   *       return loadOtherRelatedIds(source.id);
   *     },
   *   }),
   * });
   *
   * const Person = g.object<{
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   fields: {
   *     ...nodeFields,
   *     name: g.field({ type: g.String }),
   *   },
   * });
   * ```
   */
  fields: <
    Source,
  >(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
    youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
  }) => <
    Fields extends Record<
      string,
      GField<Source, any, GOutputType<Context>, any, Context>
    > & {
      [Key in keyof Source]?: GField<
        Source,
        any,
        GOutputType<Context>,
        Source[Key],
        Context
      >;
    },
  >(
    fields: Fields
  ) => Fields;
  /**
   * Creates a GraphQL interface field.
   *
   * These will generally be passed directly to the `fields` object in a
   * {@link interfaceFunc `g.interface`} call. Interfaces fields are similar to
   * {@link GField regular fields} except that they **don't define how the field
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
   * Note that {@link GField regular fields} are assignable to
   * {@link GInterfaceField interface fields} but the opposite is not true. This
   * means that you can use a regular field in an
   * {@link GInterfaceType interface type}.
   */
  interfaceField: <
    Args extends { [Key in keyof Args]: GArg<GInputType> },
    Type extends GOutputType<Context>,
  >(
    field: InterfaceFieldFuncArgs<Args, Type, Context>
  ) => GInterfaceField<Args, Type, Context>;
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
  interface: <
    Source,
  >(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
    youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
  }) => <
    Fields extends {
      [Key in keyof Fields]: GInterfaceField<
        any,
        GOutputType<Context>,
        Context
      >;
    } & InterfacesToInterfaceFields<Interfaces>,
    const Interfaces extends readonly GInterfaceType<
      Source,
      any,
      Context
    >[] = [],
  >(
    config: GInterfaceTypeConfig<Source, Fields, Interfaces, Context>
  ) => GInterfaceType<Source, Fields, Context>;
};

export function bindGraphQLSchemaAPIToContext<
  Context,
>(): GraphQLSchemaAPIWithContext<Context> {
  return {
    object() {
      return function objectInner(config) {
        return new GObjectType(config);
      };
    },
    union(config) {
      return new GUnionType(config as any);
    },
    field(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.field()");
      }
      return field as any;
    },
    fields() {
      return function fieldsInner(fields) {
        return fields;
      };
    },
    interfaceField(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.interfaceField()");
      }
      return field as any;
    },
    interface() {
      return function interfaceInner(config) {
        return new GInterfaceType(config);
      };
    },
  };
}

type Flatten<T> = {
  [Key in keyof T]: T[Key];
} & {};
