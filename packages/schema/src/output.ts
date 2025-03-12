import type {
  GraphQLFieldExtensions,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo,
  GraphQLUnionTypeConfig,
  GraphQLArgumentConfig,
  GraphQLInputFieldConfig,
  GraphQLScalarTypeConfig,
  FieldDefinitionNode,
} from "graphql";
import {
  GArg,
  GEnumType,
  GEnumTypeConfig,
  GEnumValueConfig,
  GField,
  GInputObjectType,
  GInputObjectTypeConfig,
  GInputType,
  GInterfaceField,
  GInterfaceType,
  GInterfaceTypeConfig,
  GList,
  GNonNull,
  GNullableInputType,
  GNullableType,
  GObjectType,
  GOutputType,
  GScalarType,
  GType,
  GUnionType,
  InferValueFromOutputType,
  InferValueFromArgs,
  InferValueFromInputType,
} from "./types";
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
} from "graphql";
import type { g } from "./g-for-doc-references";

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

type Maybe<T> = T | null | undefined;

type FieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  Context,
> = {
  args?: Args;
  type: Type;
  description?: Maybe<string>;
  deprecationReason?: Maybe<string>;
  extensions?: Maybe<Readonly<GraphQLFieldExtensions<Source, Context>>>;
  astNode?: Maybe<FieldDefinitionNode>;
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

export type GWithContext<Context> = {
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
   * `g<typeof g.object<Source>>` along with making `fields` a function that
   * returns the object.
   *
   * ```ts
   * type PersonSource = { name: string; friends: PersonSource[] };
   *
   * const Person: g<typeof g.object<PersonSource>> =
   *   g.object<PersonSource>()({
   *     name: "Person",
   *     fields: () => ({
   *       name: g.field({ type: g.String }),
   *       friends: g.field({ type: g.list(Person) }),
   *     }),
   *   });
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
   * {@link g.interface} call. Interfaces fields are similar to
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
    field: GInterfaceField<Args, Type, Context>
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
  /**
   * A shorthand to easily create {@link GEnumValueConfig enum values} to pass to
   * {@link g.enum}.
   *
   * If you need to set a `description` or `deprecationReason` for an enum
   * variant, you should pass values directly to `g.enum` without using
   * `g.enumValues`.
   *
   * ```ts
   * const MyEnum = g.enum({
   *   name: "MyEnum",
   *   values: g.enumValues(["a", "b"]),
   * });
   * ```
   *
   * ```ts
   * const values = g.enumValues(["a", "b"]);
   *
   * assertDeepEqual(values, {
   *   a: { value: "a" },
   *   b: { value: "b" },
   * });
   * ```
   */
  enumValues: <const Values extends readonly string[]>(
    values: readonly [...Values]
  ) => {
    [Key in Values[number]]: GEnumValueConfig<Key>;
  };

  /**
   * Creates an {@link GEnumType enum type} with a number of
   * {@link GEnumValueConfig enum values}.
   *
   * ```ts
   * const MyEnum = g.enum({
   *   name: "MyEnum",
   *   values: g.enumValues(["a", "b"]),
   * });
   * // ==
   * graphql`
   *   enum MyEnum {
   *     a
   *     b
   *   }
   * `;
   * ```
   *
   * ```ts
   * const MyEnum = g.enum({
   *   name: "MyEnum",
   *   description: "My enum does things",
   *   values: {
   *     something: {
   *       description: "something something",
   *       value: "something",
   *     },
   *     thing: {
   *       description: "thing thing",
   *       deprecationReason: "something should be used instead of thing",
   *       value: "thing",
   *     },
   *   },
   * });
   * // ==
   * graphql`
   *   """
   *   My enum does things
   *   """
   *   enum MyEnum {
   *     """
   *     something something
   *     """
   *     something
   *     """
   *     thing thing
   *     """
   *     thing @\deprecated(reason: "something should be used instead of thing")
   *   }
   * `;)
   * ```
   */
  enum: <Values extends Record<string, unknown>>(
    config: GEnumTypeConfig<Values>
  ) => GEnumType<Values>;
  /**
   * Creates a {@link GArg GraphQL argument}.
   *
   * Args can can be used as arguments on output fields:
   *
   * ```ts
   * g.field({
   *   type: g.String,
   *   args: {
   *     something: g.arg({ type: g.String }),
   *   },
   *   resolve(source, { something }) {
   *     return something || somethingElse;
   *   },
   * });
   * // ==
   * graphql`(something: String): String`;
   * ```
   *
   * Or as fields on input objects:
   *
   * ```ts
   * const Something = g.inputObject({
   *   name: "Something",
   *   fields: {
   *     something: g.arg({ type: g.String }),
   *   },
   * });
   * // ==
   * graphql`
   *   input Something {
   *     something: String
   *   }
   * `;
   * ```
   */
  arg: <
    Type extends GInputType,
    DefaultValue extends InferValueFromInputType<Type> | undefined = undefined,
  >(
    arg: Flatten<
      {
        type: Type;
      } & Omit<
        GraphQLInputFieldConfig & GraphQLArgumentConfig,
        "type" | "defaultValue"
      >
    > &
      (undefined extends DefaultValue
        ? { defaultValue?: DefaultValue }
        : { defaultValue: DefaultValue })
  ) => GArg<Type, DefaultValue extends undefined ? false : true>;
  /**
   * Creates an {@link GInputObjectType input object type}
   *
   * ```ts
   * const Something = g.inputObject({
   *   name: "Something",
   *   fields: {
   *     something: g.arg({ type: g.String }),
   *   },
   * });
   * // ==
   * graphql`
   *   input Something {
   *     something: String
   *   }
   * `;
   * ```
   *
   * ### Handling circular objects
   *
   * Circular input objects require explicitly specifying the fields on the
   * object in the type because of TypeScript's limits with circularity.
   *
   * ```ts
   * import { GInputObjectType } from "@graphql-ts/schema";
   *
   * type SomethingInputType = GInputObjectType<{
   *   something: g<typeof g.arg<SomethingInputType>>;
   * }>;
   * const Something: SomethingInputType = g.inputObject({
   *   name: "Something",
   *   fields: () => ({
   *     something: g.arg({ type: Something }),
   *   }),
   * });
   * ```
   *
   * You can specify all of your non-circular fields outside of the fields
   * object and then use `typeof` to get the type to avoid writing the
   * non-circular fields as types again.
   *
   * ```ts
   * import { GInputObjectType } from "@graphql-ts/schema";
   *
   * const nonCircularFields = {
   *   thing: g.arg({ type: g.String }),
   * };
   * type SomethingInputType = GInputObjectType<
   *   typeof nonCircularFields & {
   *     something: g<typeof g.arg<SomethingInputType>>;
   *   }
   * >;
   * const Something: SomethingInputType = g.inputObject({
   *   name: "Something",
   *   fields: () => ({
   *     ...nonCircularFields,
   *     something: g.arg({ type: Something }),
   *   }),
   * });
   * ```
   */
  inputObject: <
    Fields extends {
      [key: string]: IsOneOf extends true
        ? GArg<GNullableInputType, false>
        : GArg<GInputType>;
    },
    IsOneOf extends boolean = false,
  >(
    config: GInputObjectTypeConfig<Fields, IsOneOf>
  ) => GInputObjectType<Fields, IsOneOf>;
  /**
   * Wraps any GraphQL type in a {@link GList list type}.
   *
   * ```ts
   * const stringListType = g.list(g.String);
   * // ==
   * graphql`[String]`;
   * ```
   *
   * When used as an input type, you will recieve an array of the inner type.
   *
   * ```ts
   * g.field({
   *   type: g.String,
   *   args: { thing: g.arg({ type: g.list(g.String) }) },
   *   resolve(source, { thing }) {
   *     const theThing: undefined | null | Array<string | null> = thing;
   *     return "";
   *   },
   * });
   * ```
   *
   * When used as an output type, you can return an iterable of the inner type
   * that also matches `typeof val === 'object'` so for example, you'll probably
   * return an Array most of the time but you could also return a Set you
   * couldn't return a string though, even though a string is an iterable, it
   * doesn't match `typeof val === 'object'`.
   *
   * ```ts
   * g.field({
   *   type: g.list(g.String),
   *   resolve() {
   *     return [""];
   *   },
   * });
   * ```
   *
   * ```ts
   * g.field({
   *   type: g.list(g.String),
   *   resolve() {
   *     return new Set([""]);
   *   },
   * });
   * ```
   *
   * ```ts
   * g.field({
   *   type: g.list(g.String),
   *   resolve() {
   *     // this will not be allowed
   *     return "some things";
   *   },
   * });
   * ```
   */
  list: <Of extends GType<any>>(of: Of) => GList<Of>;
  /**
   * Wraps a {@link GNullableType nullable type} with a
   * {@link GNonNull non-nullable type}.
   *
   * Types in GraphQL are always nullable by default so if you want to enforce
   * that a type must always be there, you can use the non-null type.
   *
   * ```ts
   * const nonNullableString = g.nonNull(g.String);
   * // ==
   * graphql`String!`;
   * ```
   *
   * When using a non-null type as an input type, your resolver will never
   * recieve null and consumers of your GraphQL API **must** provide a value for
   * it unless you provide a default value.
   *
   * ```ts
   * g.field({
   *   args: {
   *     someNonNullAndRequiredArg: g.arg({
   *       type: g.nonNull(g.String),
   *     }),
   *     someNonNullButOptionalArg: g.arg({
   *       type: g.nonNull(g.String),
   *       defaultValue: "some default",
   *     }),
   *   },
   *   type: g.String,
   *   resolve(source, args) {
   *     // both of these will always be a string
   *     args.someNonNullAndRequiredArg;
   *     args.someNonNullButOptionalArg;
   *
   *     return "";
   *   },
   * });
   * // ==
   * graphql`
   *   fieldName(
   *     someNonNullAndRequiredArg: String!
   *     someNonNullButOptionalArg: String! = "some default"
   *   ): String
   * `;
   * ```
   *
   * When using a non-null type as an output type, your resolver must never
   * return null. If you do return null(which unless you do
   * type-casting/ts-ignore/etc. `@graphql-ts/schema` will not let you do)
   * graphql-js will return an error to consumers of your GraphQL API.
   *
   * Non-null types should be used very carefully on output types. If you have
   * to do a fallible operation like a network request or etc. to get the value,
   * it probably shouldn't be non-null. If you make a field non-null and doing
   * the fallible operation fails, consumers of your GraphQL API will be unable
   * to see any of the other fields on the object that the non-null field was
   * on. For example, an id on some type is a good candidate for being non-null
   * because if you have the item, you will already have the id so getting the
   * id will never fail but fetching a related item from a database would be
   * fallible so even if it will never be null in the success case, you should
   * make it nullable.
   *
   * ```ts
   * g.field({
   *   type: g.nonNull(g.String),
   *   resolve(source, args) {
   *     return "something";
   *   },
   * });
   * // ==
   * graphql`
   *   fieldName: String!
   * `;
   * ```
   *
   * If you try to wrap another non-null type in a non-null type again, you will
   * get a type error.
   *
   * ```ts
   * // Argument of type 'NonNullType<ScalarType<string>>'
   * // is not assignable to parameter of type 'NullableType'.
   * g.nonNull(g.nonNull(g.String));
   * ```
   */
  nonNull: <Of extends GNullableType<any>>(of: Of) => GNonNull<Of>;
  /**
   * Creates a {@link GScalarType scalar type}.
   *
   * ```ts
   * const BigInt = g.scalar({
   *   name: "BigInt",
   *   serialize(value) {
   *     if (typeof value !== "bigint")
   *       throw new GraphQLError(
   *         `unexpected value provided to BigInt scalar: ${value}`
   *       );
   *     return value.toString();
   *   },
   *   parseLiteral(value) {
   *     if (value.kind !== "StringValue")
   *       throw new GraphQLError("BigInt only accepts values as strings");
   *     return globalThis.BigInt(value.value);
   *   },
   *   parseValue(value) {
   *     if (typeof value === "bigint") return value;
   *     if (typeof value !== "string")
   *       throw new GraphQLError("BigInt only accepts values as strings");
   *     return globalThis.BigInt(value);
   *   },
   * });
   * // for fields on output types
   * g.field({ type: someScalar });
   *
   * // for args on output fields or fields on input types
   * g.arg({ type: someScalar });
   * ```
   *
   * Note, while graphql-js allows you to express scalar types like the `ID`
   * type which accepts integers and strings as both input values and return
   * values from resolvers which are transformed into strings before calling
   * resolvers and returning the query respectively, the type you use should be
   * `string` for `ID` since that is what it is transformed into.
   * `@graphql-ts/schema` doesn't currently express the coercion of scalars, you
   * should instead convert values to the canonical form yourself before
   * returning from resolvers.
   */
  scalar: <Internal, External = Internal>(
    config: GraphQLScalarTypeConfig<Internal, External>
  ) => GScalarType<Internal, External>;
  ID: GScalarType<string>;
  String: GScalarType<string>;
  Float: GScalarType<number>;
  Int: GScalarType<number>;
  Boolean: GScalarType<boolean>;
};

/**
 * The `gWithContext` export is the primary entrypoint into using
 * `@graphql-ts/schema` that lets you compose GraphQL types into a GraphQL
 * Schema
 *
 * A simple schema with only a query type looks like this.
 *
 * ```ts
 * import { gWithContext } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 *
 * type Context = {};
 *
 * const g = gWithContext<Context>();
 * type g<T> = gWithContext.infer<T>;
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
 *       query {
 *         hello
 *       }
 *     `,
 *   schema,
 * }).then((result) => {
 *   console.log(result);
 * });
 * ```
 *
 * You can use pass the `schema` to `ApolloServer` and other GraphQL servers.
 *
 * You can also create a more advanced schema with other object types, circular
 * types, args, and mutations. See {@link GWithContext} for what the other
 * functions on `g` do.
 *
 * ```ts
 * import { gWithContext } from "@graphql-ts/schema";
 * import { GraphQLSchema, graphql } from "graphql";
 * import { deepEqual } from "node:assert";
 *
 * type Context = {
 *   todos: Map<string, TodoItem>;
 * };
 *
 * const g = gWithContext<Context>();
 * type g<T> = gWithContext.infer<T>;
 *
 * type TodoItem = {
 *   id: string;
 *   title: string;
 *   relatedTodos: string[];
 * };
 *
 * const Todo: g<typeof g.object<TodoItem>> = g.object<TodoItem>()({
 *   name: "Todo",
 *   fields: () => ({
 *     id: g.field({ type: g.nonNull(g.ID) }),
 *     title: g.field({ type: g.nonNull(g.String) }),
 *     relatedTodos: g.field({
 *       type: g.list(Todo),
 *       resolve(source, _args, context) {
 *         return source.relatedTodos
 *           .map((id) => context.todos.get(id))
 *           .filter((todo) => todo !== undefined);
 *       },
 *     }),
 *   }),
 * });
 *
 * const Query = g.object()({
 *   name: "Query",
 *   fields: {
 *     todos: g.field({
 *       type: g.list(Todo),
 *       resolve(_source, _args, context) {
 *         return context.todos.values();
 *       },
 *     }),
 *   },
 * });
 *
 * const Mutation = g.object()({
 *   name: "Mutation",
 *   fields: {
 *     createTodo: g.field({
 *       args: {
 *         title: g.arg({ type: g.nonNull(g.String) }),
 *         relatedTodos: g.arg({
 *           type: g.nonNull(g.list(g.nonNull(g.ID))),
 *           defaultValue: [],
 *         }),
 *       },
 *       type: Todo,
 *       resolve(_source, { title, relatedTodos }, context) {
 *         const todo = { title, relatedTodos, id: crypto.randomUUID() };
 *         context.todos.set(todo.id, todo);
 *         return todo;
 *       },
 *     }),
 *   },
 * });
 *
 * const schema = new GraphQLSchema({
 *   query: Query,
 *   mutation: Mutation,
 * });
 *
 * (async () => {
 *   const contextValue: Context = { todos: new Map() };
 *   {
 *     const result = await graphql({
 *       source: `
 *         query {
 *           todos {
 *             title
 *           }
 *         }
 *       `,
 *       schema,
 *       contextValue,
 *     });
 *     deepEqual(result, { data: { todos: [] } });
 *   }
 *
 *   {
 *     const result = await graphql({
 *       source: `
 *         mutation {
 *           createTodo(title: "Try graphql-ts") {
 *             title
 *           }
 *         }
 *       `,
 *       schema,
 *       contextValue,
 *     });
 *     deepEqual(result, {
 *       data: { createTodo: { title: "Try graphql-ts" } },
 *     });
 *   }
 *   {
 *     const result = await graphql({
 *       source: `
 *         query {
 *           todos {
 *             title
 *           }
 *         }
 *       `,
 *       schema,
 *       contextValue,
 *     });
 *     deepEqual(result, {
 *       data: { todos: [{ title: "Try graphql-ts" }] },
 *     });
 *   }
 * })();
 * ```
 */
export function gWithContext<Context>(): GWithContext<Context> {
  return {
    scalar(config) {
      return new GScalarType(config);
    },
    list(of) {
      return new GList(of);
    },
    nonNull(of) {
      return new GNonNull(of);
    },
    inputObject(config) {
      return new GInputObjectType(config);
    },
    enum(config) {
      return new GEnumType(config);
    },
    union(config) {
      return new GUnionType(config as any);
    },
    object() {
      return function objectInner(config) {
        return new GObjectType(config);
      };
    },
    interface() {
      return function interfaceInner(config) {
        return new GInterfaceType(config);
      };
    },
    fields() {
      return function fieldsInner(fields) {
        return fields;
      };
    },
    field(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.field()");
      }
      return field;
    },
    interfaceField(field) {
      if (!field.type) {
        throw new Error("A type must be passed to g.interfaceField()");
      }
      return field;
    },
    arg(arg) {
      if (!arg.type) {
        throw new Error("A type must be passed to g.arg()");
      }
      return arg as any;
    },
    enumValues(values) {
      return Object.fromEntries(
        values.map((value) => [value, { value }])
      ) as any;
    },
    Int: GraphQLInt,
    Float: GraphQLFloat,
    String: GraphQLString,
    Boolean: GraphQLBoolean,
    ID: GraphQLID,
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace gWithContext {
  /**
   * The `gWithContext.infer` type is useful particularly when defining circular
   * types to resolve errors from TypeScript because of the circularity.
   *
   * We recommend aliasing `gWithContext.infer` to your `g` like this to make it
   * easier to use:
   *
   * ```ts
   * import { gWithContext } from "@graphql-ts/schema";
   * type Context = {};
   *
   * const g = gWithContext<Context>();
   * type g<T> = gWithContext.infer<T>;
   *
   * type PersonSource = { name: string; friends: PersonSource[] };
   *
   * const Person: g<typeof g.object<PersonSource>> =
   *   g.object<PersonSource>()({
   *     name: "Person",
   *     fields: () => ({
   *       name: g.field({ type: g.String }),
   *       friends: g.field({ type: g.list(Person) }),
   *     }),
   *   });
   * ```
   */
  export type infer<T> = T extends () => (args: any) => infer R
    ? R
    : T extends (args: any) => infer R
      ? R
      : never;
}

type Flatten<T> = {
  [Key in keyof T]: T[Key];
} & {};
