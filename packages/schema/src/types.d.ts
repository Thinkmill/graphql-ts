/**
 * This module exports modified versions of the GraphQL types from the `graphql`
 * package that add more type-safety but are still at runtime exactly the same
 * as the original types. Some of the constructors
 *
 * @module
 */
import {
  GraphQLArgumentExtensions,
  GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLEnumValueConfig,
  GraphQLFieldExtensions,
  GraphQLInputField,
  GraphQLInputFieldExtensions,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo,
  GraphQLScalarType,
  type GraphQLTypeResolver,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql/type/definition";
import type {
  FieldDefinitionNode,
  InputValueDefinitionNode,
} from "graphql/language/ast";
import { InferValueFromOutputType } from "./output";
import type {
  field,
  union,
  interface as interface_,
  interfaceField,
  object,
} from "./api-with-context";
import type {
  scalar,
  enum as enum_,
  inputObject,
  arg,
} from "./api-without-context";
import { InferValueFromArgs } from "./api-without-context/input";

type Maybe<T> = T | null | undefined;

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

/**
 * A GraphQL output field for an {@link GObjectType object type} which should be
 * created using {@link field `g.field`}.
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
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
  __missingResolve?: (arg: SourceAtKey) => void;
};

/**
 * A GraphQL object type. This should generally be constructed with
 * {@link object `g.object`}.
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
 * {@link union `g.union`}.
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
 * be constructed with {@link interface_ `g.interface`}.
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
  toConfig(): Omit<ReturnType<GraphQLInterfaceType["toConfig"]>, "fields"> & {
    fields: Fields;
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

/**
 * A GraphQL argument. These should be created with {@link arg `g.arg`}
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
> = {
  type: Type;
  defaultValue: HasDefaultValue extends true ? {} | null : undefined;
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
  Omit<GraphQLInputObjectTypeConfig, "fields"> & {
    fields: Fields | (() => Fields);
    isOneOf?: IsOneOf;
  }
> &
  (true extends IsOneOf ? { isOneOf: unknown } : unknown);

/**
 * A GraphQL input object type. This should generally be constructed with
 * {@link inputObject `g.inputObject`}.
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
    [K in keyof Fields]: GraphQLInputField & {
      type: Fields[K]["type"];
      defaultValue: Fields[K]["defaultValue"];
    };
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
 * A GraphQL enum type. This should generally be constructed with
 * {@link enum_ `g.enum`}.
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
      [Name in keyof Values]: Partial<GEnumValueConfig<Values[Name]>>;
    };
  };
}

/**
 * A GraphQL enum type. This should generally be constructed with
 * {@link enum_ `g.enum`}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.enum` so it is safe to use directly
 * if desired.
 *
 * Also unlike some other types in this module, this type is exactly equivalent
 * to the original {@link GraphQLEnumType `GraphQLEnumType`} type from the
 * `graphql` package.
 */
export class GScalarType<
  Internal = unknown,
  External = Internal,
> extends GraphQLScalarType<Internal, External> {}

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * A GraphQL non-null type. This should generally be constructed with
 * {@link enum_ `g.nonNull`}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.nonNull` so it is safe to use
 * directly if desired.
 *
 * Also unlike the named types in this module, the original
 * {@link GraphQLNonNull `GraphQLNonNull`} type from the `graphql` package cannot
 * be assigned to a variable of type `GNonNull`. Though `GNonNull` _is_
 * assignable to `GraphQLNonNull`.
 *
 * For example, the following code will not compile:
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
  get [Symbol.toStringTag](): "GraphQLNonNull";
}

/**
 * A GraphQL list type. This should generally be constructed with
 * {@link list `g.list`}.
 *
 * Unlike some other constructors in this module, this constructor functions
 * exactly the same as it's counterpart `g.list` so it is safe to use directly
 * if desired.
 *
 * Also unlike the named types in this module, the original
 * {@link GraphQLList `GraphQLList`} type from the `graphql` package cannot be
 * assigned to a variable of type `GList`. Though `GList` _is_ assignable to
 * `GraphQLList`.
 *
 * For example, the following code will not compile:
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
  get [Symbol.toStringTag](): "GraphQLList";
}

export {};
