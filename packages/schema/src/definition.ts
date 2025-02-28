import {
  GraphQLArgumentConfig,
  GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLEnumValue,
  type GraphQLEnumValueConfig,
  GraphQLFieldExtensions,
  GraphQLFieldResolver,
  GraphQLInputField,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLList,
  GraphQLNamedInputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLType,
  type GraphQLTypeResolver,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql/type/definition";
import { Maybe } from "graphql/jsutils/Maybe";
import { FieldDefinitionNode } from "graphql";
import { InferValueFromOutputType } from "./output";
import { InferValueFromArgs } from "./api-without-context";

export type GOutputType<Context> =
  | GraphQLScalarType
  | GObjectType<any, Context>
  | GInterfaceType<any, any, Context>
  | GUnionType<any, Context>
  | GraphQLEnumType
  | GList<GOutputType<Context>>
  | GNonNull<
      | GraphQLScalarType
      | GObjectType<any, Context>
      | GInterfaceType<any, any, Context>
      | GUnionType<any, Context>
      | GraphQLEnumType
      | GList<GOutputType<Context>>
    >;

export type AnyGOutputType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GList<AnyGOutputType>
  | GNonNull<
      | GraphQLScalarType
      | GraphQLObjectType
      | GraphQLInterfaceType
      | GraphQLUnionType
      | GraphQLEnumType
      | GList<AnyGOutputType>
    >;

export type GType =
  | GraphQLNamedType
  | GList<GraphQLNamedType>
  | GNonNull<GraphQLNamedType | GList<GType>>;

export type GInputType =
  | GraphQLNamedInputType
  | GList<GInputType>
  | GNonNull<GraphQLNamedInputType | GList<GInputType>>;

export type GNullableInputType = GraphQLNamedInputType | GList<GInputType>;

export type GNullableType =
  | GraphQLNamedType
  | GList<GNullableType | GNonNull<GNullableType>>;

/**
 * A GraphQL output field for an {@link ObjectType} which should be created using
 * {@link field `g.field`}.
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
  resolve?: GraphQLFieldResolver<
    Source,
    Context,
    InferValueFromArgs<Args>,
    InferValueFromOutputType<Type>
  >;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>;
  __sourceAtKey?: (arg: SourceAtKey) => void;
};

type OrFunc<T> = T | (() => T);

export type GObjectTypeConfig<Source, Context> = Flatten<
  {
    fields: OrFunc<{
      [key: string]: GField<Source, any, any, any, Context>;
    }>;
    interfaces?: readonly GInterfaceType<Source, any, Context>[];
  } & Omit<GraphQLObjectTypeConfig<Source, Context>, "fields" | "interfaces">
>;

export class GObjectType<Source, Context> extends GraphQLObjectType<
  Source,
  Context
> {
  constructor(config: Readonly<GObjectTypeConfig<Source, Context>>) {
    super(config);
  }
}

export type GUnionTypeConfig<Source, Context> = Flatten<
  Omit<GraphQLUnionTypeConfig<Source, Context>, "types"> & {
    types: OrFunc<readonly GObjectType<Source, Context>[]>;
  }
>;

export class GUnionType<Source, Context> extends GraphQLUnionType {
  constructor(config: Readonly<GUnionTypeConfig<Source, Context>>) {
    super(config);
  }
  declare resolveType: Maybe<GraphQLTypeResolver<Source, Context>>;
  getTypes(): ReadonlyArray<GObjectType<Source, Context>> {
    return super.getTypes();
  }
}

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

export type GInterfaceTypeConfig<
  Source,
  Fields extends Record<
    string,
    GInterfaceField<any, GOutputType<Context>, Context>
  >,
  Interfaces extends readonly GInterfaceType<Source, any, Context>[],
  Context,
> = Omit<GraphQLInterfaceTypeConfig<Source, Context>, "fields"> & {
  fields: Fields;
  interfaces?: [...Interfaces];
};

type GInterfaceTypeNormalizedConfig<Fields> = Omit<
  ReturnType<GraphQLInterfaceType["toConfig"]>,
  "fields"
> & {
  fields: Fields;
};

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
  ) {
    super(config);
  }
  toConfig(): GInterfaceTypeNormalizedConfig<Fields> {
    return super.toConfig() as any;
  }
}

export type GArg<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = {
  type: Type;
  defaultValue: HasDefaultValue extends true ? {} | null : undefined;
} & Flatten<Omit<GraphQLInputFieldConfig & GraphQLArgumentConfig, "type">>;

export type GInputField<
  Type extends GInputType,
  HasDefaultValue extends boolean = boolean,
> = GraphQLInputField & {
  type: Type;
  defaultValue: HasDefaultValue extends true ? {} | null : undefined;
};

export type GInputObjectTypeConfig<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<Exclude<GInputType, GNonNull<any>>, false>
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

export class GInputObjectType<
  Fields extends {
    [key: string]: IsOneOf extends true
      ? GArg<GNullableInputType, false>
      : GArg<GInputType>;
  },
  IsOneOf extends boolean = false,
> extends GraphQLInputObjectType {
  declare isOneOf: IsOneOf;
  constructor(config: Readonly<GInputObjectTypeConfig<Fields, IsOneOf>>) {
    super(config);
  }
  getFields(): {
    [K in keyof Fields]: GInputField<Fields[K]["type"]> & {
      defaultValue: Fields[K]["defaultValue"];
    };
  } {
    return super.getFields() as any;
  }
}

export type GEnumValue<Name extends string, Value> = Flatten<
  Omit<GraphQLEnumValue, "value"> & {
    name: Name;
    value: Value;
  }
>;

export type GEnumValueConfig<Value> = GraphQLEnumValueConfig & {
  value: Value;
};

export type GEnumTypeConfig<Values extends { [key: string]: unknown }> =
  Flatten<
    Omit<GraphQLEnumTypeConfig, "values"> & {
      values: {
        [Name in keyof Values]: GEnumValueConfig<Values[Name]>;
      };
    }
  >;

export class GEnumType<
  const Values extends { [key: string]: unknown },
> extends GraphQLEnumType {
  constructor(config: Readonly<GEnumTypeConfig<Values>>) {
    super(config);
  }
  getValues(): ReadonlyArray<
    ValuesOfObj<{
      [K in keyof Values]: GEnumValue<K & string, Values[K]>;
    }>
  > {
    return super.getValues() as ReadonlyArray<any>;
  }
  getValue<K extends keyof Values & string>(name: K): GEnumValue<K, Values[K]> {
    return super.getValue(name) as GEnumValue<K, Values[K]>;
  }
}

export class GScalarType<
  Internal = unknown,
  External = Internal,
> extends GraphQLScalarType<Internal, External> {}

type ValuesOfObj<T> = T[keyof T];

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

export class GNonNull<Of extends GNullableType> extends GraphQLNonNull<Of> {
  get [Symbol.toStringTag](): "GraphQLNonNull" {
    return "GraphQLNonNull";
  }
}

export class GList<Of extends GraphQLType> extends GraphQLList<Of> {
  get [Symbol.toStringTag](): "GraphQLList" {
    return "GraphQLList";
  }
}
