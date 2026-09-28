/**
 * This module exports modified versions of the GraphQL types from the `graphql`
 * package that add more type-safety but are still at runtime exactly the same
 * as the original types. Some of the constructors
 *
 * @module
 */
import type {
  GraphQLArgumentConfig,
  GraphQLArgumentExtensions,
  GraphQLEnumType,
  GraphQLEnumTypeConfig,
  GraphQLFieldConfigMap,
  GraphQLEnumValueConfig,
  GraphQLFieldExtensions,
  GraphQLFieldMap,
  GraphQLInputField,
  GraphQLInputFieldExtensions,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLTypeResolver,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
  FieldDefinitionNode,
  InputValueDefinitionNode,
} from "graphql";
import type { g } from "./g-for-doc-references.ts";

type Maybe<T> = T | null | undefined;

export type GraphQLDefaultInput = GraphQLArgumentConfig["default" &
  keyof GraphQLArgumentConfig];

// Preserve GraphQL.js's property metadata, including deprecation annotations.
export type LegacyDefaultValue<
  Value,
  IsRequired extends boolean = undefined extends Value ? false : true,
> = Pick<GraphQLArgumentConfig, "defaultValue"> &
  (IsRequired extends true
    ? { defaultValue: Value }
    : { defaultValue?: Value });

export type NativeDefault<
  Value,
  IsRequired extends boolean = undefined extends Value ? false : true,
> = "default" extends keyof GraphQLArgumentConfig
  ? Pick<GraphQLArgumentConfig, "default" & keyof GraphQLArgumentConfig> &
      (IsRequired extends true ? { default: Value } : { default?: Value })
  : {};

export type GNullableOutputType<Context> =
  | GScalarType
  | GObjectType<any, Context>
  | GInterfaceType<any, any, Context>
  | GUnionType<any, Context>
  | GEnumType<Record<string, unknown>>
  | GList<GOutputType<Context>>;

export type GOutputType<Context> =
  | GNullableOutputType<Context>
  | GNonNull<GNullableOutputType<Context>>;

export type GNullableInputType =
  | GScalarType
  | GEnumType<Record<string, unknown>>
  | GInputObjectType<any, boolean>
  | GList<GInputType>;

export type GInputType = GNullableInputType | GNonNull<GNullableInputType>;

export type GNullableType<Context> =
  | GNullableOutputType<Context>
  | GNullableInputType;

export type GType<Context> = GOutputType<Context> | GInputType;

export type GFieldResolver<
  Source,
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = (
  source: Source,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<Type>;

type InferValueFromOutputTypeWithoutAddingNull<Type extends GOutputType<any>> =
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

type InferValueFromNullableInputType<Type extends GInputType> =
  Type extends GraphQLScalarType<infer Value, any>
    ? Value
    : Type extends GraphQLEnumType
      ? Type extends GEnumType<infer Values>
        ? Values[keyof Values]
        : unknown
      : Type extends GList<infer Value extends GInputType>
        ? InferValueFromInputType<Value>[]
        : Type extends GraphQLInputObjectType
          ? Type extends GInputObjectType<infer Fields, infer IsOneOf>
            ? IsOneOf extends true
              ? InferValueForOneOf<Fields>
              : InferValueFromArgs<Fields>
            : Record<string, unknown>
          : never;

type InferExternalValueFromNullableInputType<Type extends GInputType> =
  // Broad input types have no known external shape. Expanding them as lists
  // would recursively infer their elements without reaching a concrete type.
  GNullableInputType extends Type
    ? unknown
    : Type extends GraphQLScalarType<any, infer Value>
      ? Value
      : Type extends GraphQLEnumType
        ? Type extends GEnumType<infer Values>
          ? keyof Values & string
          : unknown
        : Type extends GList<infer Value extends GInputType>
          ? // A null input represents a null list, not a singleton null element.
            | Exclude<InferExternalValueFromInputType<Value>, null>
            | (object & Iterable<InferExternalValueFromInputType<Value>>)
          : Type extends GraphQLInputObjectType
            ? Type extends GInputObjectType<infer Fields, infer IsOneOf>
              ? IsOneOf extends true
                ? InferExternalValueForOneOf<Fields>
                : InferExternalValueFromArgs<Fields>
              : Record<string, unknown>
            : never;

type OneOf<Values, Key extends keyof Values = keyof Values> = Flatten<
  Key extends unknown
    ? {
        readonly [K in Key]: Values[K];
      } & {
        readonly [K in Exclude<keyof Values, Key>]?: never;
      }
    : never
>;

type InferValueForOneOf<T extends { [key: string]: { type: GInputType } }> =
  OneOf<{
    [K in keyof T]: InferValueFromNullableInputType<T[K]["type"]>;
  }>;

type InferExternalValueForOneOf<
  T extends { [key: string]: { type: GInputType } },
> = OneOf<{
  [K in keyof T]: InferExternalValueFromNullableInputType<T[K]["type"]>;
}>;

export type InferValueFromArgs<Args extends Record<string, GArg<GInputType>>> =
  {
    readonly [Key in keyof Args]: InferValueFromArg<Args[Key]>;
  } & {};

type RequiredExternalArgKeys<Args extends Record<string, GArg<GInputType>>> = {
  // Coercion fills defaults and permits omitted nullable fields.
  [Key in keyof Args]: Args[Key]["type"] extends GNonNull<any>
    ? Args[Key] extends GArg<any, true>
      ? never
      : Key
    : never;
}[keyof Args];

type InferExternalValueFromArgs<Args extends Record<string, GArg<GInputType>>> =
  Flatten<
    {
      readonly [
        Key in RequiredExternalArgKeys<Args>
      ]: InferExternalValueFromInputType<Args[Key]["type"]>;
    } & {
      readonly [Key in Exclude<keyof Args, RequiredExternalArgKeys<Args>>]?:
        | InferExternalValueFromInputType<Args[Key]["type"]>
        | undefined;
    }
  >;

export type InferValueFromArg<Arg extends GArg<GInputType>> =
  // the distribution technically only needs to be around the AddUndefined
  // but having it here instead of inside the union
  // means that TypeScript will print the resulting type
  // when you use it rather than keep the alias and
  // the resulting type is generally far more readable
  Arg extends unknown
    ?
        | InferValueFromInputType<Arg["type"]>
        | (Arg extends GArg<Arg["type"], true>
            ? never
            : AddUndefined<Arg["type"]>)
    : never;

type AddUndefined<TInputType extends GInputType> =
  TInputType extends GNonNull<any> ? never : undefined;

export type InferValueFromInputType<Type extends GInputType> =
  Type extends GNonNull<infer Value extends GNullableInputType>
    ? InferValueFromNullableInputType<Value>
    : InferValueFromNullableInputType<Type> | null;

/**
 * Infers the externally represented value accepted by input coercion for an
 * input type.
 *
 * This differs from `InferValueFromInputType`, which infers the internal value
 * passed to resolvers after scalar and enum coercion.
 *
 * For scalars, this uses the serialized output type (the second type parameter
 * of `GraphQLScalarType`) as an approximation of accepted input. GraphQL.js
 * does not encode accepted input types separately, so some values accepted at
 * runtime may be excluded. For example, `ID` is typed as `string` even though
 * it also accepts integer inputs. Custom scalars whose accepted inputs differ
 * from their serialized outputs have the same limitation.
 */
export type InferExternalValueFromInputType<Type extends GInputType> =
  GInputType extends Type
    ? unknown
    : Type extends GNonNull<infer Value extends GNullableInputType>
      ? InferExternalValueFromNullableInputType<Value>
      : InferExternalValueFromNullableInputType<Type> | null;

/**
 * A GraphQL output field for an {@link GObjectType object type} which should be
 * created using {@link g.field}.
 */
export type GField<
  Source,
  Args extends { [Key in keyof Args]: GArg<GInputType> },
  Type extends GOutputType<Context>,
  SourceAtKey,
  Context,
> = {
  args?: Args;
  type: Type;
  resolve?: GFieldResolver<Source, Args, Type, Context>;
  description?: Maybe<string>;
  deprecationReason?: Maybe<string>;
  extensions?: Maybe<Readonly<GraphQLFieldExtensions<any, Context>>>;
  astNode?: Maybe<FieldDefinitionNode>;
  __missingResolve: undefined | ((arg: SourceAtKey) => void);
};

/**
 * A GraphQL object type. This should generally be constructed with
 * {@link g.object}.
 *
 * Note this is an **output** type, if you want an input object, use
 * {@link GInputObjectType}.
 *
 * If you use the `GObjectType` constructor directly, all fields will need
 * explicit resolvers so you should use `g.object` instead.
 */
export class GObjectType<Source, Context> extends GraphQLObjectType<
  Source,
  Context
> {
  constructor(
    config: Readonly<
      GObjectTypeConfig<
        Source,
        Context,
        Record<string, GField<Source, any, any, unknown, Context>>,
        readonly GInterfaceType<Source, any, Context>[]
      >
    >
  );
}

export type GObjectTypeConfig<
  Source,
  Context,
  Fields extends Record<string, GField<Source, any, any, any, Context>>,
  Interfaces extends readonly GInterfaceType<Source, any, Context>[],
> = {
  fields: Fields | (() => Fields);
  interfaces?: [...Interfaces];
} & Omit<GraphQLObjectTypeConfig<Source, Context>, "fields" | "interfaces">;

/**
 * A GraphQL union type. This should generally be constructed with
 * {@link g.union}.
 *
 * A union type represents an object that could be one of a list of types. Note
 * it is similar to an {@link GInterfaceType} except that a union doesn't imply
 * having a common set of fields among the member types.
 *
 * While this constructor will work, you should generally use `g.union` because
 * you will need to explicitly provide the source type parameter as TypeScript
 * is unable to infer it correctly. Note this is only required for this
 * constructor, this is not required when using `g.union`.
 */
export class GUnionType<Source, Context> extends GraphQLUnionType {
  constructor(
    config: Readonly<
      GUnionTypeConfig<
        Source extends any ? GObjectType<Source, Context> : never,
        Context
      >
    >
  );
  resolveType: Maybe<GraphQLTypeResolver<Source, Context>>;
  toConfig(): Omit<ReturnType<GraphQLUnionType["toConfig"]>, "resolveType"> & {
    resolveType?: Maybe<GraphQLTypeResolver<Source, Context>>;
  };
}

export type GUnionTypeConfig<
  ObjectType extends GObjectType<any, Context>,
  Context,
> = Flatten<
  {
    types: readonly ObjectType[] | (() => readonly ObjectType[]);
  } & Omit<
    GraphQLUnionTypeConfig<
      ObjectType extends GObjectType<infer Source, Context> ? Source : never,
      Context
    >,
    "types"
  >
>;

export type GInterfaceField<
  Args extends Record<string, GArg<GInputType>>,
  Type extends GOutputType<Context>,
  Context,
> = {
  description?: Maybe<string>;
  type: Type;
  args?: Args;
  deprecationReason?: Maybe<string>;
  extensions?: Maybe<Readonly<GraphQLFieldExtensions<any, Context>>>;
  astNode?: Maybe<FieldDefinitionNode>;
};

/**
 * A GraphQL interface type that can be implemented by other
 * {@link GObjectType GraphQL object} and interface types. This should generally
 * be constructed with {@link g.interface}.
 *
 * If you use the `GInterfaceType` constructor directly, all fields will need
 * explicit resolvers so you should use `g.interface` instead.
 */
export class GInterfaceType<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Context,
> extends GraphQLInterfaceType {
  declare resolveType: Maybe<GraphQLTypeResolver<Source, Context>>;
  getFields(): GraphQLFieldMap<Source, Context>;
  constructor(
    config: Readonly<
      GInterfaceTypeConfig<
        Source,
        Fields,
        readonly GInterfaceType<Source, {}, Context>[],
        Context
      >
    >
  );
  toConfig(): Omit<
    ReturnType<GraphQLInterfaceType["toConfig"]>,
    "fields" | "resolveType"
  > & {
    fields: {
      [Key in keyof Fields]: Fields[Key] & {
        args: {
          [Arg in keyof NonNullable<Fields[Key]["args"]>]: NativeDefault<
            GraphQLDefaultInput,
            true
          > & {
            extensions: Readonly<GraphQLArgumentExtensions>;
          };
        };
        extensions: Readonly<GraphQLFieldExtensions<Source, Context>>;
      };
    };
    resolveType?: Maybe<GraphQLTypeResolver<Source, Context>>;
  };
}

export type GInterfaceTypeConfig<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Interfaces extends readonly GInterfaceType<Source, any, Context>[],
  Context,
> = Flatten<
  {
    fields: Fields | (() => Fields);
    interfaces?: [...Interfaces];
  } & Omit<GraphQLInterfaceTypeConfig<Source, Context>, "interfaces" | "fields">
>;

type GArgDefaults<HasDefaultValue extends boolean> =
  HasDefaultValue extends true
    ?
        | (LegacyDefaultValue<{} | null, true> &
            NativeDefault<GraphQLDefaultInput, false>)
        | ("default" extends keyof GraphQLArgumentConfig
            ? LegacyDefaultValue<undefined, false> &
                NativeDefault<Exclude<GraphQLDefaultInput, undefined>, true>
            : never)
    : LegacyDefaultValue<undefined, false> & NativeDefault<undefined, false>;

/**
 * A GraphQL argument. These should be created with {@link g.arg}
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
 * graphql`fieldName(something: String): String`;
 * ```
 *
 * Or as fields on input objects:
 *
 * ```ts
 * g.inputObject({
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
 * When the type of an arg is {@link GNonNull non-null}, the value will always
 * exist.
 *
 * ```ts
 * g.field({
 *   type: g.String,
 *   args: {
 *     something: g.arg({ type: g.nonNull(g.String) }),
 *   },
 *   resolve(source, { something }) {
 *     // `something` will always be a string
 *     return something;
 *   },
 * });
 * // ==
 * graphql`fieldName(something: String!): String`;
 * ```
 */
export type GArg<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = GArgDefaults<HasDefaultValue> & {
  type: Type;
  description?: Maybe<string>;
  deprecationReason?: Maybe<string>;
  extensions?: Maybe<GraphQLInputFieldExtensions & GraphQLArgumentExtensions>;
  astNode?: Maybe<InputValueDefinitionNode>;
};

export type GInputObjectTypeConfig<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<GNullableInputType, false>
      : GArg<GInputType>;
  },
  IsOneOf extends boolean = false,
> = Flatten<
  Omit<GraphQLInputObjectTypeConfig, "fields" | "isOneOf"> & {
    fields: Fields | (() => Fields);
  }
> &
  (false extends IsOneOf ? { isOneOf?: IsOneOf } : { isOneOf: IsOneOf });

type ResolvedInputFieldDefaults<Arg extends GArg<GInputType>> =
  // Broad fields must still accept native GraphQLInputField instances.
  GArg<Arg["type"]> extends Arg
    ? {}
    : // Preserve the alternative ways a concrete field can have a default.
      Arg extends unknown
      ? Pick<Arg, "defaultValue" | ("default" & keyof Arg)>
      : never;

// Override the type property instead of intersecting it with GraphQLInputType,
// which loses scalar inference when a resolved field is reused as an argument.
interface TypedInputField<
  Type extends GraphQLInputType,
  DefaultValue,
> extends GraphQLInputField {
  type: Type;
  defaultValue: DefaultValue;
}

/**
 * A GraphQL input object type. This should generally be constructed with
 * {@link g.inputObject}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.inputObject` so it is safe to use
 * directly if desired.
 */
export class GInputObjectType<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<GNullableInputType, false>
      : GArg<GInputType>;
  },
  IsOneOf extends boolean = false,
> extends GraphQLInputObjectType {
  isOneOf: IsOneOf;
  constructor(config: Readonly<GInputObjectTypeConfig<Fields, IsOneOf>>);
  getFields(): {
    [K in keyof Fields]: TypedInputField<
      Fields[K]["type"],
      Fields[K]["defaultValue"]
    > &
      ResolvedInputFieldDefaults<Fields[K]>;
  };
}

export type GEnumValueConfig<Value> = GraphQLEnumValueConfig & {
  value: Value;
};

export type GEnumTypeConfig<Values extends { [key: string]: unknown }> =
  Flatten<
    {
      values: {
        [Name in keyof Values]: GEnumValueConfig<Values[Name]>;
      };
    } & Omit<GraphQLEnumTypeConfig, "values">
  >;

/**
 * A GraphQL enum type. This should generally be constructed with {@link g.enum}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.enum` so it is safe to use directly
 * if desired.
 */
export class GEnumType<
  const Values extends { [key: string]: unknown },
> extends GraphQLEnumType {
  constructor(config: Readonly<GEnumTypeConfig<Values>>);
  toConfig(): Omit<ReturnType<GraphQLEnumType["toConfig"]>, "values"> & {
    values: {
      [Name in keyof Values]: ReturnType<
        GraphQLEnumType["toConfig"]
      >["values"][string] &
        Partial<GEnumValueConfig<Values[Name]>>;
    };
  };
}

/**
 * A GraphQL enum type. This should generally be constructed with
 * {@link g.scalar}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.scalar` so it is safe to use directly
 * if desired.
 *
 * Also unlike some other types in this module, this type is exactly equivalent
 * to the original {@link GraphQLScalarType `GraphQLScalarType`} type from the
 * `graphql` package.
 */
export class GScalarType<
  Internal = unknown,
  External = Internal,
> extends GraphQLScalarType<Internal, External> {}

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

// this is so that on graphql 16 and below where GraphQLNonNull and GraphQLList are structurally compatible
// we make them non-compatible with a get [Symbol.toStringTag]() with a string literal
// but in graphql 17, properties were added to make them incompatible so we don't need to do this anymore
// this means that on graphql 17 GraphQLNonNull and GNonNull are assignable in both directions
// and same for GraphQLList and GList
type GNonNullToStringTag =
  GraphQLNonNull<any> extends GraphQLList<any> ? "GraphQLNonNull" : string;
type GListToStringTag =
  GraphQLNonNull<any> extends GraphQLList<any> ? "GraphQLList" : string;

/**
 * A GraphQL non-null type. This should generally be constructed with
 * {@link g.nonNull}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.nonNull` so it is safe to use
 * directly if desired.
 *
 * On GraphQL 17, native and wrapped non-null types are mutually assignable. On
 * GraphQL 16, unlike the named types in this module, the original
 * {@link GraphQLNonNull `GraphQLNonNull`} type from the `graphql` package
 * cannot be assigned to a variable of type `GNonNull`. Though `GNonNull` _is_
 * assignable to `GraphQLNonNull`.
 *
 * For example, on GraphQL 16 the following code will not compile:
 *
 * ```ts
 * const nonNull: GNonNull<GScalarType<string>> = new GraphQLNonNull(
 *   GraphQLString
 * );
 * ```
 *
 * But the following code will compile:
 *
 * ```ts
 * const nonNull: GraphQLNonNull<GraphQLScalarType<string>> = new GNonNull(
 *   GraphQLString
 * );
 * ```
 *
 * This is due to the lack of a discriminating property between the
 * `GraphQLNonNull` and `GraphQLList` types.
 */
export class GNonNull<
  Of extends GNullableType<any>,
> extends GraphQLNonNull<Of> {
  get [Symbol.toStringTag](): GNonNullToStringTag;
}

/**
 * A GraphQL list type. This should generally be constructed with
 * {@link g.list}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.list` so it is safe to use directly
 * if desired.
 *
 * On GraphQL 17, native and wrapped list types are mutually assignable. On
 * GraphQL 16, unlike the named types in this module, the original
 * {@link GraphQLList `GraphQLList`} type from the `graphql` package cannot be
 * assigned to a variable of type `GList`. Though `GList` _is_ assignable to
 * `GraphQLList`.
 *
 * For example, on GraphQL 16 the following code will not compile:
 *
 * ```ts
 * const list: GList<GScalarType<string>> = new GraphQLList(GraphQLString);
 * ```
 *
 * But the following code will compile:
 *
 * ```ts
 * const list: GraphQLList<GraphQLScalarType<string>> = new GList(
 *   GraphQLString
 * );
 * ```
 *
 * This is due to the lack of a discriminating property between the
 * `GraphQLNonNull` and `GraphQLList` types.
 */
export class GList<Of extends GType<any>> extends GraphQLList<Of> {
  get [Symbol.toStringTag](): GListToStringTag;
}

export {};
