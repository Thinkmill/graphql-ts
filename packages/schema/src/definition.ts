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
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  type GraphQLTypeResolver,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql/type/definition";
import { Maybe } from "graphql/jsutils/Maybe";
import { FieldDefinitionNode } from "graphql";
import { InferValueFromOutputType } from "./output";
import { InferValueFromArgs } from "./api-without-context";

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
  __missingResolve?: (arg: SourceAtKey) => void;
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

export class GUnionType<Source, Context> extends GraphQLUnionType {
  constructor(config: Readonly<GraphQLUnionTypeConfig<Source, Context>>) {
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
  fields: Fields | (() => Fields);
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
  toConfig(): Omit<ReturnType<GraphQLEnumType["toConfig"]>, "values"> & {
    values: {
      [Name in keyof Values]: Partial<GEnumValueConfig<Values[Name]>>;
    };
  } {
    return super.toConfig() as any;
  }
}

export class GScalarType<
  Internal = unknown,
  External = Internal,
> extends GraphQLScalarType<Internal, External> {}

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

export class GNonNull<
  Of extends GNullableType<any>,
> extends GraphQLNonNull<Of> {
  get [Symbol.toStringTag](): "GraphQLNonNull" {
    return "GraphQLNonNull";
  }
}

export class GList<Of extends GType<any>> extends GraphQLList<Of> {
  get [Symbol.toStringTag](): "GraphQLList" {
    return "GraphQLList";
  }
}
