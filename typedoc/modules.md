[@graphql-ts/schema](README.md) / Exports

# @graphql-ts/schema

## Table of contents

### References

- [Arg](modules.md#arg)
- [EnumType](modules.md#enumtype)
- [EnumValue](modules.md#enumvalue)
- [InferValueFromArg](modules.md#infervaluefromarg)
- [InferValueFromArgs](modules.md#infervaluefromargs)
- [InferValueFromInputType](modules.md#infervaluefrominputtype)
- [InferValueFromOutputType](modules.md#infervaluefromoutputtype)
- [InputObjectType](modules.md#inputobjecttype)
- [InputType](modules.md#inputtype)
- [ListType](modules.md#listtype)
- [NonNullType](modules.md#nonnulltype)
- [NullableInputType](modules.md#nullableinputtype)
- [ScalarType](modules.md#scalartype)

### Namespaces

- [schema](modules/schema.md)

### Type aliases

- [Field](modules.md#field)
- [FieldResolver](modules.md#fieldresolver)
- [InterfaceField](modules.md#interfacefield)
- [InterfaceType](modules.md#interfacetype)
- [NullableOutputType](modules.md#nullableoutputtype)
- [NullableType](modules.md#nullabletype)
- [ObjectType](modules.md#objecttype)
- [OutputType](modules.md#outputtype)
- [SchemaAPIWithContext](modules.md#schemaapiwithcontext)
- [Type](modules.md#type)
- [UnionType](modules.md#uniontype)

### Functions

- [bindSchemaAPIToContext](modules.md#bindschemaapitocontext)

## References

### Arg

Re-exports: [Arg](modules/schema.md#arg)

___

### EnumType

Re-exports: [EnumType](modules/schema.md#enumtype)

___

### EnumValue

Re-exports: [EnumValue](modules/schema.md#enumvalue)

___

### InferValueFromArg

Re-exports: [InferValueFromArg](modules/schema.md#infervaluefromarg)

___

### InferValueFromArgs

Re-exports: [InferValueFromArgs](modules/schema.md#infervaluefromargs)

___

### InferValueFromInputType

Re-exports: [InferValueFromInputType](modules/schema.md#infervaluefrominputtype)

___

### InferValueFromOutputType

Re-exports: [InferValueFromOutputType](modules/schema.md#infervaluefromoutputtype)

___

### InputObjectType

Re-exports: [InputObjectType](modules/schema.md#inputobjecttype)

___

### InputType

Re-exports: [InputType](modules/schema.md#inputtype)

___

### ListType

Re-exports: [ListType](modules/schema.md#listtype)

___

### NonNullType

Re-exports: [NonNullType](modules/schema.md#nonnulltype)

___

### NullableInputType

Re-exports: [NullableInputType](modules/schema.md#nullableinputtype)

___

### ScalarType

Re-exports: [ScalarType](modules/schema.md#scalartype)

## Type aliases

### Field

Ƭ **Field**<RootVal, Args, TType, Key, Context\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Args` | `Args`: `Record`<string, [Arg](modules/schema.md#arg)<any\>\> |
| `TType` | `TType`: [OutputType](modules.md#outputtype)<Context\> |
| `Key` | `Key`: `string` |
| `Context` | `Context` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `Context`) => `void` |
| `__key` | `Key` |
| `__rootVal` | (`rootVal`: `RootVal`) => `void` |
| `args?` | `Args` |
| `deprecationReason?` | `string` |
| `description?` | `string` |
| `extensions?` | `Readonly`<GraphQLFieldExtensions<RootVal, Context, [InferValueFromArgs](modules/schema.md#infervaluefromargs)<Args\>\>\> |
| `resolve?` | [FieldResolver](modules.md#fieldresolver)<RootVal, Args, TType, Context\> |
| `type` | `TType` |

#### Defined in

[output.ts:112](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L112)

___

### FieldResolver

Ƭ **FieldResolver**<RootVal, Args, TType, Context\>: (`rootVal`: `RootVal`, `args`: [InferValueFromArgs](modules/schema.md#infervaluefromargs)<Args\>, `context`: `Context`, `info`: `GraphQLResolveInfo`) => [InferValueFromOutputType](modules/schema.md#infervaluefromoutputtype)<TType\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Args` | `Args`: `Record`<string, [Arg](modules/schema.md#arg)<any\>\> |
| `TType` | `TType`: [OutputType](modules.md#outputtype)<Context\> |
| `Context` | `Context` |

#### Type declaration

▸ (`rootVal`, `args`, `context`, `info`): [InferValueFromOutputType](modules/schema.md#infervaluefromoutputtype)<TType\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `rootVal` | `RootVal` |
| `args` | [InferValueFromArgs](modules/schema.md#infervaluefromargs)<Args\> |
| `context` | `Context` |
| `info` | `GraphQLResolveInfo` |

##### Returns

[InferValueFromOutputType](modules/schema.md#infervaluefromoutputtype)<TType\>

#### Defined in

[output.ts:98](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L98)

___

### InterfaceField

Ƭ **InterfaceField**<Args, Type, Context\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Args` | `Args`: `Record`<string, [Arg](modules/schema.md#arg)<any\>\> |
| `Type` | `Type`: [OutputType](modules.md#outputtype)<Context\> |
| `Context` | `Context` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `args?` | `Args` |
| `deprecationReason?` | `string` |
| `description?` | `string` |
| `extensions?` | `Readonly`<GraphQLFieldExtensions<any, any, [InferValueFromArgs](modules/schema.md#infervaluefromargs)<Args\>\>\> |
| `type` | `Type` |

#### Defined in

[output.ts:132](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L132)

___

### InterfaceType

Ƭ **InterfaceType**<RootVal, Fields, Context\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Fields` | `Fields`: `Record`<string, [InterfaceField](modules.md#interfacefield)<any, [OutputType](modules.md#outputtype)<Context\>, Context\>\> |
| `Context` | `Context` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `Context`) => `void` |
| `__rootVal` | (`rootVal`: `RootVal`) => `void` |
| `fields` | () => `Fields` |
| `graphQLType` | `GraphQLInterfaceType` |
| `kind` | ``"interface"`` |

#### Defined in

[output.ts:495](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L495)

___

### NullableOutputType

Ƭ **NullableOutputType**<Context\>: [ScalarType](modules/schema.md#scalartype)<any\> \| [ObjectType](modules.md#objecttype)<any, Context\> \| [UnionType](modules.md#uniontype)<any, Context\> \| [InterfaceType](modules.md#interfacetype)<any, any, Context\> \| [EnumType](modules/schema.md#enumtype)<any\> \| `OutputListTypeWithContext`<Context\>

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Defined in

[output.ts:49](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L49)

___

### NullableType

Ƭ **NullableType**<Context\>: [ScalarType](modules/schema.md#scalartype)<any\> \| [ListType](modules/schema.md#listtype)<any\> \| [InputObjectType](modules/schema.md#inputobjecttype)<any\> \| [ObjectType](modules.md#objecttype)<any, Context\> \| [UnionType](modules.md#uniontype)<any, Context\> \| [InterfaceType](modules.md#interfacetype)<any, any, Context\> \| [EnumType](modules/schema.md#enumtype)<any\>

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Defined in

[type.ts:12](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/type.ts#L12)

___

### ObjectType

Ƭ **ObjectType**<RootVal, Context\>: `Object`

#### Type parameters

| Name |
| :------ |
| `RootVal` |
| `Context` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `Context`) => `void` |
| `__rootVal` | `RootVal` |
| `graphQLType` | `GraphQLObjectType` |
| `kind` | ``"object"`` |

#### Defined in

[output.ts:89](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L89)

___

### OutputType

Ƭ **OutputType**<Context\>: [NullableOutputType](modules.md#nullableoutputtype)<Context\> \| `OutputNonNullTypeWithContext`<Context\>

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Defined in

[output.ts:57](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L57)

___

### SchemaAPIWithContext

Ƭ **SchemaAPIWithContext**<Context\>: `Object`

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `field` | `FieldFunc`<Context\> | Creates a GraphQL field. These will generally be passed directly to `fields` object in a `schema.object` call.  ```ts const Something = schema.object<{ thing: string }>()({   name: "Something",   fields: {     thing: schema.field({ type: schema.String }),   }, }); ``` |
| `fields` | `FieldsFunc`<Context\> | A helper to easily share fields across object and interface types.  ```ts const nodeFields = schema.fields<{ id: string }>({   id: schema.field({ type: schema.ID }), });  const Node = schema.field({   name: "Node",   fields: nodeFields, });  const Person = schema.object<{   __typename: "Person";   id: string;   name: string; }>()({   name: "Person",   interfaces: [Node],   fields: {     ...nodeFields,     name: schema.field({ type: schema.String }),   }, }); ```  ## Why use `schema.fields` instead of just creating an object?  The definition of Field in `@ts-gql/schema` has some special things, let's look at the definition of it:  ```ts type Field<   RootVal,   Args extends Record<string, Arg<any>>,   TType extends OutputType<Context>,   Key extends string,   Context > = ...; ```  There's two especially notable bits in there which need to be inferred from elsewhere, the `RootVal` and `Key` type params.  The `RootVal` is pretty simple and it's quite simple to see why `schema.fields` is useful here. You could explicitly write it with resolvers on the first arg but you'd have to do that on every field which would get very repetitive and wouldn't work for fields without resolvers.  ```ts const someFields = schema.fields<{ name: string }>()({   name: schema.field({ type: schema.String }), }); ```  The `Key` type param might seem a bit more strange though. What it's saying is that *the key that a field is at is part of its TypeScript type*.  This is important to be able to represent the fact that a resolver is optional if the `RootVal` has a .  ```ts const someFields = schema.fields<{ name: string }>()({   someName: schema.field({ type: schema.String }), });  const someFields = schema.fields<{ name: string }>()({   someName: schema.field({ type: schema.String }), }); ``` |
| `interface` | `InterfaceTypeFunc`<Context\> | Creates a GraphQL interface type that can be used in other GraphQL object and interface types.  ```ts const Entity = schema.interface()({   name: "Entity",   fields: {     name: schema.interfaceField({ type: schema.String }),   }, });  type PersonRootVal = { __typename: "Person"; name: string };  const Person = schema.object<PersonRootVal>()({   name: "Person",   interfaces: [Entity],   fields: {     name: schema.field({ type: schema.String }),   }, });  type OrganisationRootVal = {   __typename: "Organisation";   name: string; };  const Organisation = schema.object<OrganisationRootVal>()({   name: "Organisation",   interfaces: [Entity],   fields: {     name: schema.field({ type: schema.String }),   }, }); ```  ## Resolving Types  When using GraphQL interface and union types, there needs to a way to determine which concrete object type has been returned from a resolver. With `graphql-js` and `@ts-gql/schema`, this is done with `isTypeOf` on object types and `resolveType` on interface and union types. Note `@ts-gql/schema` **does not aim to strictly type the implementation of `resolveType` and `isTypeOf`**. If you don't provide `resolveType` or `isTypeOf`, a `__typename` property on the root value will be used, if that fails, an error will be thrown at runtime.  ## Fields vs Interface Fields  You might have noticed that `schema.interfaceField` was used instead of `schema.field` for the fields on the interfaces. This is because **interfaces aren't defining implementation of fields** which means that fields on an interface don't need define resolvers.  ## Sharing field implementations  Even though interfaces don't contain field implementations, you may still want to share field implementations between interface implementations. You can use `schema.fields` to do that. See `schema.fields` for more information about why you should use `schema.fields` instead of just defining an object the fields and spreading that.  ```ts const nodeFields = schema.fields<{ id: string }>({   id: schema.field({ type: schema.ID }), });  const Node = schema.field({   name: "Node",   fields: nodeFields, });  const Person = schema.object<{   __typename: "Person";   id: string;   name: string; }>()({   name: "Person",   interfaces: [Node],   fields: {     ...nodeFields,     name: schema.field({ type: schema.String }),   }, }); ``` |
| `interfaceField` | `InterfaceFieldFunc`<Context\> | - |
| `object` | `ObjectTypeFunc`<Context\> | Creates a GraphQL object type. Note this is an **output** type, if you want an input object, use `schema.inputObject`.  When calling `schema.object`, you must provide a type parameter that is the root value of the object type. The root value what you receive as the first argument of resolvers on this type and what you must return from resolvers of fields that return this type.  ```ts const Person = schema.object<{ name: string }>()({   name: "Person",   fields: {     name: schema.field({ type: schema.String }),   }, }); // == graphql`   type Person {     name: String   } `; ```  ## Writing resolvers  To do anything other than just return a field from the RootVal, you need to provide a resolver.  Note: TypeScript will force you to provide a resolve function if the field in the RootVal and the GraphQL field don't match  ```ts const Person = schema.object<{ name: string }>()({   name: "Person",   fields: {     name: schema.field({ type: schema.String }),     excitedName: schema.field({       type: schema.String,       resolve(rootVal, args, context, info) {         return `${rootVal.name}!`;       },     }),   }, }); ```  ## Circularity  GraphQL types will often contain references to themselves and to make TypeScript allow that, you need have an explicit type annotation of `schema.ObjectType<RootVal>` along with making `fields` a function that returns the object.  ```ts type PersonRootVal = { name: string; friends: PersonRootVal[] };  const Person: schema.ObjectType<PersonRootVal> =   schema.object<PersonRootVal>()({     name: "Person",     fields: () => ({       name: schema.field({ type: schema.String }),       friends: schema.field({ type: schema.list(Person) }),     }),   }); ``` |
| `union` | `UnionTypeFunc`<Context\> | - |

#### Defined in

[output.ts:561](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L561)

___

### Type

Ƭ **Type**<Context\>: [NullableType](modules.md#nullabletype)<Context\> \| { `__context`: `unknown` ; `graphQLType`: `GraphQLNullableType` ; `kind`: ``"non-null"`` ; `of`: [NullableType](modules.md#nullabletype)<Context\>  }

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Defined in

[type.ts:21](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/type.ts#L21)

___

### UnionType

Ƭ **UnionType**<RootVal, Context\>: `Object`

#### Type parameters

| Name |
| :------ |
| `RootVal` |
| `Context` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `Context`) => `void` |
| `__rootVal` | `RootVal` |
| `graphQLType` | `GraphQLUnionType` |
| `kind` | ``"union"`` |

#### Defined in

[output.ts:402](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L402)

## Functions

### bindSchemaAPIToContext

▸ **bindSchemaAPIToContext**<Context\>(): [SchemaAPIWithContext](modules.md#schemaapiwithcontext)<Context\>

#### Type parameters

| Name |
| :------ |
| `Context` |

#### Returns

[SchemaAPIWithContext](modules.md#schemaapiwithcontext)<Context\>

#### Defined in

[output.ts:808](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L808)
