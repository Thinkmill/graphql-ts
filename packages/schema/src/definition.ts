import {
  GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLEnumValue,
  type GraphQLEnumValueConfig,
  type GraphQLFieldMap,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLInputType,
  GraphQLInterfaceType,
  type GraphQLInterfaceTypeConfig,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  type GraphQLTypeResolver,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql/type/definition";
import { Maybe } from "graphql/jsutils/Maybe";

export class GObjectType<Source, Context> extends GraphQLObjectType<
  Source,
  Context
> {
  constructor(config: Readonly<GraphQLObjectTypeConfig<Source, Context>>) {
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

export class GInterfaceType<Source, Context> extends GraphQLInterfaceType {
  declare resolveType: Maybe<GraphQLTypeResolver<Source, Context>>;
  constructor(config: Readonly<GraphQLInterfaceTypeConfig<Source, Context>>) {
    super(config);
  }
  getFields(): GraphQLFieldMap<Source, Context> {
    return super.getFields();
  }
}

export type GInputFieldConfig<Type extends GraphQLInputType> =
  GraphQLInputFieldConfig & {
    type: Type;
    defaultValue?: unknown;
  };

export class GInputObjectType<
  Fields extends {},
  IsOneOf extends boolean
> extends GraphQLInputObjectType {
  declare isOneOf: IsOneOf;
  constructor(config: Readonly<GraphQLInputObjectTypeConfig>) {
    super(config);
  }
}

export type GEnumValue<Name extends string, Value> = GraphQLEnumValue & {
  name: Name;
  value: Value;
};

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
  Values extends { [key: string]: unknown }
> extends GraphQLEnumType {
  constructor(config: Readonly<GEnumTypeConfig<Values>>) {
    super(config);
  }
  getValues(): ReadonlyArray<
    ValuesOfObj<
      {
        [K in keyof Values]: GEnumValue<K & string, Values[K]>;
      }
    >
  > {
    return super.getValues() as ReadonlyArray<any>;
  }
  getValue<K extends keyof Values & string>(name: K): GEnumValue<K, Values[K]> {
    return super.getValue(name) as GEnumValue<K, Values[K]>;
  }
}

export class GScalarType<
  Internal = unknown,
  External = Internal
> extends GraphQLScalarType<Internal, External> {}

type ValuesOfObj<T> = T[keyof T];

type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};
