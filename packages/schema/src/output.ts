import {
  GraphQLFieldConfigMap,
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeExtensions,
  GraphQLIsTypeOfFn,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
  GraphQLUnionType,
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

type OutputListTypeWithContext<Context> = {
  kind: "list";
  of: OutputType<Context>;
  graphQLType: GraphQLList<any>;
  __context: (context: Context) => void;
};

type OutputNonNullTypeWithContext<Context> = {
  kind: "non-null";
  of: NullableOutputType<Context>;
  graphQLType: GraphQLNonNull<NullableOutputType<Context>["graphQLType"]>;
  __context: (context: Context) => void;
};

export type NullableOutputType<Context> =
  | ScalarType<any>
  | ObjectType<any, Context>
  | UnionType<any, Context>
  | InterfaceType<any, any, Context>
  | EnumType<any>
  | OutputListTypeWithContext<Context>;

export type OutputType<Context> =
  | NullableOutputType<Context>
  | OutputNonNullTypeWithContext<Context>;

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
    : Type extends ObjectType<infer RootVal, any>
    ? RootVal
    : Type extends UnionType<infer RootVal, any>
    ? RootVal
    : Type extends InterfaceType<infer RootVal, any, any>
    ? RootVal
    : never;

type OutputNonNullTypeForInference<Of extends NullableOutputType<any>> =
  NonNullType<Of>;

export type InferValueFromOutputType<Type extends OutputType<any>> =
  MaybePromise<
    Type extends OutputNonNullTypeForInference<infer Value>
      ? InferValueFromOutputTypeWithoutAddingNull<Value>
      : InferValueFromOutputTypeWithoutAddingNull<Type> | null
  >;

export type ObjectType<RootVal, Context> = {
  kind: "object";
  graphQLType: GraphQLObjectType;
  __context: (context: Context) => void;
  __rootVal: RootVal;
};

/** @component Something */
type MaybePromise<T> = Promise<T> | T;

export type FieldResolver<
  RootVal,
  Args extends Record<string, Arg<any>>,
  TType extends OutputType<Context>,
  Context
> = (
  rootVal: RootVal,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<TType>;

type SomeTypeThatIsntARecordOfArgs = string;

/** A `@graphq` */
export type Field<
  RootVal,
  Args extends Record<string, Arg<any>>,
  TType extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: TType;
  __key: Key;
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  resolve?: FieldResolver<RootVal, Args, TType, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<RootVal, Context, InferValueFromArgs<Args>>
  >;
};

export type InterfaceField<
  Args extends Record<string, Arg<any>>,
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

type FieldFuncResolve<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> =
  // the tuple is here because we _don't_ want this to be distributive
  // if this was distributive then it would optional when it should be required e.g.
  // schema.object<{ id: string } | { id: boolean }>()({
  //   name: "Node",
  //   fields: {
  //     id: schema.field({
  //       type: schema.nonNull(schema.ID),
  //     }),
  //   },
  // });
  [RootVal] extends [
    {
      [K in Key]:
        | InferValueFromOutputType<Type>
        | ((
            args: InferValueFromArgs<Args>,
            context: Context,
            info: GraphQLResolveInfo
          ) => InferValueFromOutputType<Type>);
    }
  ]
    ? {
        resolve?: FieldResolver<
          RootVal,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >;
      }
    : {
        resolve: FieldResolver<
          RootVal,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >;
      };

type FieldFuncArgs<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
} & FieldFuncResolve<RootVal, Args, Type, Key, Context>;

export type FieldFunc<Context> = <
  RootVal,
  Type extends OutputType<Context>,
  Key extends string,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: FieldFuncArgs<RootVal, Args, Type, Key, Context>
) => Field<RootVal, Args, Type, Key, Context>;

function bindFieldToContext<Context>(): FieldFunc<Context> {
  return function field(field) {
    if (!field.type) {
      throw new Error("A type must be passed to schema.field()");
    }
    return field as any;
  };
}

export type InterfaceToInterfaceFields<
  Interface extends InterfaceType<any, any, any>
> = Interface extends InterfaceType<any, infer Fields, any> ? Fields : never;

type InterfaceFieldToOutputField<
  RootVal,
  Context,
  TField extends InterfaceField<any, any, Context>,
  Key extends string
> = TField extends InterfaceField<infer Args, infer OutputType, Context>
  ? Field<RootVal, Args, OutputType, Key, Context>
  : never;

type InterfaceFieldsToOutputFields<
  RootVal,
  Context,
  Fields extends { [Key in keyof Fields]: InterfaceField<any, any, Context> }
> = {
  [Key in keyof Fields]: InterfaceFieldToOutputField<
    RootVal,
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
  RootVal,
  Context,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[]
> = UnionToIntersection<
  InterfaceFieldsToOutputFields<
    RootVal,
    Context,
    InterfaceToInterfaceFields<Interfaces[number]>
  >
>;

export type ObjectTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      RootVal,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  } &
    InterfacesToOutputFields<RootVal, Context, Interfaces>,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[] = []
>(config: {
  name: string;
  fields: MaybeFunc<Fields>;
  /**
   * A description of the object type that is visible when introspected.
   *
   * ```ts
   * type Person = { name: string };
   *
   * const Person = schema.object<Person>()({
   *   name: "Person",
   *   description: "A person does things!",
   *   fields: {
   *     name: schema.field({ type: schema.String }),
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
   * `schema.interface` for more information.
   *
   * ```ts
   * const Node = schema.interface<{ kind: string }>()({
   *   name: "Node",
   *   resolveType: (rootVal) => rootVal.kind,
   *   fields: {
   *     id: schema.interfaceField({ type: schema.ID }),
   *   },
   * });
   *
   * const Person = schema.object<{ kind: "Person"; id: string }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     id: schema.field({ type: schema.ID }),
   *   },
   * });
   * ```
   */
  interfaces?: [...Interfaces];
  isTypeOf?: GraphQLIsTypeOfFn<unknown, Context>;
  extensions?: Readonly<GraphQLObjectTypeExtensions<RootVal, Context>>;
}) => ObjectType<RootVal, Context>;

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
        __rootVal: undefined as any,
        __context: undefined as any,
      };
    };
  };
}

function buildFields(
  fields: Record<
    string,
    Field<
      any,
      Record<string, Arg<InputType, any>>,
      OutputType<any>,
      string,
      any
    >
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

export type UnionType<RootVal, Context> = {
  kind: "union";
  __rootVal: RootVal;
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
    type: TObjectType["__rootVal"],
    context: Parameters<TObjectType["__context"]>[0],
    info: GraphQLResolveInfo,
    abstractType: GraphQLUnionType
  ) => string;
}) => UnionType<
  TObjectType["__rootVal"],
  Parameters<TObjectType["__context"]>[0]
>;

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
      __rootVal: undefined as any,
      __context: undefined as any,
    };
  };
}

export type FieldsFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      RootVal,
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
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
};

export type InterfaceFieldFunc<Context> = <
  RootVal,
  Type extends OutputType<Context>,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: InterfaceFieldFuncArgs<RootVal, Args, Type, Context>
) => InterfaceField<Args, Type, Context>;

function bindInterfaceFieldToContext<Context>(): InterfaceFieldFunc<Context> {
  return function interfaceField(field) {
    return field as any;
  };
}

export type InterfaceType<
  RootVal,
  Fields extends Record<
    string,
    InterfaceField<any, OutputType<Context>, Context>
  >,
  Context
> = {
  kind: "interface";
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  graphQLType: GraphQLInterfaceType;
  fields: () => Fields;
};

export type MaybeFunc<T> = T | (() => T);

export type InterfaceTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: InterfaceField<any, OutputType<Context>, Context>;
  } &
    UnionToIntersection<InterfaceToInterfaceFields<Interfaces[number]>>,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[] = []
>(config: {
  name: string;
  description?: string;
  deprecationReason?: string;
  interfaces?: [...Interfaces];
  resolveType?: GraphQLTypeResolver<RootVal, Context>;
  fields: MaybeFunc<Fields>;
  extensions?: Readonly<GraphQLInterfaceTypeExtensions>;
}) => InterfaceType<RootVal, Fields, Context>;

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
        __rootVal: undefined as any,
        __context: undefined as any,
        fields: () =>
          typeof config.fields === "function" ? config.fields() : config.fields,
      };
    };
  };
}

export type SchemaAPIWithContext<Context> = {
  /**
   * Creates a GraphQL object type. Note this is an **output** type, if you want
   * an input object, use `schema.inputObject`.
   *
   * When calling `schema.object`, you must provide a type parameter that is the
   * root value of the object type. The root value what you receive as the first
   * argument of resolvers on this type and what you must return from resolvers
   * of fields that return this type.
   *
   * ```ts
   * const Person = schema.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: schema.field({ type: schema.String }),
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
   * To do anything other than just return a field from the RootVal, you need to
   * provide a resolver.
   *
   * Note: TypeScript will force you to provide a resolve function if the field
   * in the RootVal and the GraphQL field don't match
   *
   * ```ts
   * const Person = schema.object<{ name: string }>()({
   *   name: "Person",
   *   fields: {
   *     name: schema.field({ type: schema.String }),
   *     excitedName: schema.field({
   *       type: schema.String,
   *       resolve(rootVal, args, context, info) {
   *         return `${rootVal.name}!`;
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
   * `schema.ObjectType<RootVal>` along with making `fields` a function that
   * returns the object.
   *
   * ```ts
   * type PersonRootVal = { name: string; friends: PersonRootVal[] };
   *
   * const Person: schema.ObjectType<PersonRootVal> =
   *   schema.object<PersonRootVal>()({
   *     name: "Person",
   *     fields: () => ({
   *       name: schema.field({ type: schema.String }),
   *       friends: schema.field({ type: schema.list(Person) }),
   *     }),
   *   });
   * ```
   */
  object: ObjectTypeFunc<Context>;
  union: UnionTypeFunc<Context>;
  /**
   * Creates a GraphQL field. These will generally be passed directly to
   * `fields` object in a `schema.object` call.
   *
   * ```ts
   * const Something = schema.object<{ thing: string }>()({
   *   name: "Something",
   *   fields: {
   *     thing: schema.field({ type: schema.String }),
   *   },
   * });
   * ```
   */
  field: FieldFunc<Context>;
  /**
   * A helper to easily share fields across object and interface types.
   *
   * ```ts
   * const nodeFields = schema.fields<{ id: string }>()({
   *   id: schema.field({ type: schema.ID }),
   * });
   *
   * const Node = schema.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = schema.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: schema.field({ type: schema.String }),
   *   },
   * });
   * ```
   *
   * ## Why use `schema.fields` instead of just creating an object?
   *
   * The definition of Field in `@graphql-ts/schema` has some special things,
   * let's look at the definition of it:
   *
   * ```ts
   * type Field<
   *   RootVal,
   *   Args extends Record<string, Arg<any>>,
   *   TType extends OutputType<Context>,
   *   Key extends string,
   *   Context
   * > = ...;
   * ```
   *
   * There's two especially notable bits in there which need to be inferred from
   * elsewhere, the `RootVal` and `Key` type params.
   *
   * The `RootVal` is pretty simple and it's quite simple to see why
   * `schema.fields` is useful here. You could explicitly write it with
   * resolvers on the first arg but you'd have to do that on every field which
   * would get very repetitive and wouldn't work for fields without resolvers.
   *
   * ```ts
   * const someFields = schema.fields<{ name: string }>()({
   *   name: schema.field({ type: schema.String }),
   * });
   * ```
   *
   * The `Key` type param might seem a bit more strange though. What it's saying
   * is that *the key that a field is at is part of its TypeScript type*.
   *
   * This is important to be able to represent the fact that a resolver is
   * optional if the `RootVal` has a .
   *
   * ```ts
   * const someFields = schema.fields<{ name: string }>()({
   *   someName: schema.field({ type: schema.String }),
   * });
   *
   * const someFields = schema.fields<{ name: string }>()({
   *   someName: schema.field({ type: schema.String }),
   * });
   * ```
   */
  fields: FieldsFunc<Context>;
  interfaceField: InterfaceFieldFunc<Context>;
  /**
   * Creates a GraphQL interface type that can be used in other GraphQL object
   * and interface types.
   *
   * ```ts
   * const Entity = schema.interface()({
   *   name: "Entity",
   *   fields: {
   *     name: schema.interfaceField({ type: schema.String }),
   *   },
   * });
   *
   * type PersonRootVal = { __typename: "Person"; name: string };
   *
   * const Person = schema.object<PersonRootVal>()({
   *   name: "Person",
   *   interfaces: [Entity],
   *   fields: {
   *     name: schema.field({ type: schema.String }),
   *   },
   * });
   *
   * type OrganisationRootVal = {
   *   __typename: "Organisation";
   *   name: string;
   * };
   *
   * const Organisation = schema.object<OrganisationRootVal>()({
   *   name: "Organisation",
   *   interfaces: [Entity],
   *   fields: {
   *     name: schema.field({ type: schema.String }),
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
   * `isTypeOf`, a `__typename` property on the root value will be used, if that
   * fails, an error will be thrown at runtime.
   *
   * ## Fields vs Interface Fields
   *
   * You might have noticed that `schema.interfaceField` was used instead of
   * `schema.field` for the fields on the interfaces. This is because
   * **interfaces aren't defining implementation of fields** which means that
   * fields on an interface don't need define resolvers.
   *
   * ## Sharing field implementations
   *
   * Even though interfaces don't contain field implementations, you may still
   * want to share field implementations between interface implementations. You
   * can use `schema.fields` to do that. See `schema.fields` for more
   * information about why you should use `schema.fields` instead of just
   * defining an object the fields and spreading that.
   *
   * ```ts
   * const nodeFields = schema.fields<{ id: string }>({
   *   id: schema.field({ type: schema.ID }),
   * });
   *
   * const Node = schema.field({
   *   name: "Node",
   *   fields: nodeFields,
   * });
   *
   * const Person = schema.object<{
   *   __typename: "Person";
   *   id: string;
   *   name: string;
   * }>()({
   *   name: "Person",
   *   interfaces: [Node],
   *   fields: {
   *     ...nodeFields,
   *     name: schema.field({ type: schema.String }),
   *   },
   * });
   * ```
   */
  interface: InterfaceTypeFunc<Context>;
};

export function bindSchemaAPIToContext<
  Context
>(): SchemaAPIWithContext<Context> {
  return {
    object: bindObjectTypeToContext<Context>(),
    union: bindUnionTypeToContext<Context>(),
    field: bindFieldToContext<Context>(),
    fields: bindFieldsToContext<Context>(),
    interfaceField: bindInterfaceFieldToContext<Context>(),
    interface: bindInterfaceTypeToContext<Context>(),
  };
}
