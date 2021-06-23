[@graphql-ts/schema](../README.md) / [Exports](../modules.md) / schema

# Namespace: schema

## Table of contents

### Type aliases

- [Arg](schema.md#arg)
- [Context](schema.md#context)
- [EnumType](schema.md#enumtype)
- [EnumValue](schema.md#enumvalue)
- [Field](schema.md#field)
- [FieldResolver](schema.md#fieldresolver)
- [InferValueFromArg](schema.md#infervaluefromarg)
- [InferValueFromArgs](schema.md#infervaluefromargs)
- [InferValueFromInputType](schema.md#infervaluefrominputtype)
- [InferValueFromOutputType](schema.md#infervaluefromoutputtype)
- [InputObjectType](schema.md#inputobjecttype)
- [InputType](schema.md#inputtype)
- [InterfaceField](schema.md#interfacefield)
- [InterfaceType](schema.md#interfacetype)
- [ListType](schema.md#listtype)
- [NonNullType](schema.md#nonnulltype)
- [NullableInputType](schema.md#nullableinputtype)
- [NullableOutputType](schema.md#nullableoutputtype)
- [NullableType](schema.md#nullabletype)
- [ObjectType](schema.md#objecttype)
- [OutputType](schema.md#outputtype)
- [ScalarType](schema.md#scalartype)
- [Type](schema.md#type)
- [UnionType](schema.md#uniontype)

### Variables

- [Boolean](schema.md#boolean)
- [Float](schema.md#float)
- [ID](schema.md#id)
- [Int](schema.md#int)
- [String](schema.md#string)
- [field](schema.md#field)
- [fields](schema.md#fields)
- [interface](schema.md#interface)
- [interfaceField](schema.md#interfacefield)
- [object](schema.md#object)
- [union](schema.md#union)

### Functions

- [arg](schema.md#arg)
- [enum](schema.md#enum)
- [enumValues](schema.md#enumvalues)
- [inputObject](schema.md#inputobject)
- [list](schema.md#list)
- [nonNull](schema.md#nonnull)
- [scalar](schema.md#scalar)

## Type aliases

### Arg

Ƭ **Arg**<Type, DefaultValue\>: `Object`

A `@ts-gql/schema` GraphQL argument. These should be created with
[`schema.arg`](schema.md#arg)

Args can can be used as arguments on output fields:

```ts
schema.field({
  type: schema.String,
  args: {
    something: schema.arg({ type: schema.String }),
  },
  resolve(rootVal, { something }) {
    return something || somethingElse;
  },
});
```

Or as fields on input objects:

```ts
schema.inputObject({
  name: "Something",
  fields: {
    something: schema.arg({ type: schema.String }),
  },
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | `Type`: [InputType](schema.md#inputtype) |
| `DefaultValue` | `DefaultValue`: [InferValueFromInputType](schema.md#infervaluefrominputtype)<Type\> \| `undefined` = [InferValueFromInputType](schema.md#infervaluefrominputtype)<Type\> \| `undefined` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultValue` | `DefaultValue` |
| `deprecationReason?` | `string` |
| `description?` | `string` |
| `type` | `Type` |

#### Defined in

[api-without-context/input.ts:116](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L116)

___

### Context

Ƭ **Context**: `unknown`

#### Defined in

[schema-api.ts:12](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L12)

___

### EnumType

Ƭ **EnumType**<Values\>: `Object`

An enum type for `@ts-gql/schema` which wraps an underlying graphql-js
`GraphQLEnumType`. This should be created with `schema.enum`.

```ts
const MyEnum = schema.enum({
  name: "MyEnum",
  values: schema.enumValues(["a", "b"]),
});
// ==
graphql`
  enum MyEnum {
    a
    b
  }
`;
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Values` | `Values`: `Record`<string, [EnumValue](schema.md#enumvalue)<any\>\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | `unknown` |
| `graphQLType` | `GraphQLEnumType` |
| `kind` | ``"enum"`` |
| `values` | `Values` |

#### Defined in

[api-without-context/enum.ts:38](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/enum.ts#L38)

___

### EnumValue

Ƭ **EnumValue**<Value\>: `Object`

An individual enum value

Note the value property and generic here represents the deserialized form of
the enum. It does not indicate the name of the enum value that is visible in
the GraphQL schema. The value can be anything, not necessarily a string.
Usually though, it will be a string which is equal to the key where the value is used.

#### Type parameters

| Name |
| :------ |
| `Value` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deprecationReason?` | `string` |
| `description?` | `string` |
| `value` | `Value` |

#### Defined in

[api-without-context/enum.ts:14](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/enum.ts#L14)

___

### Field

Ƭ **Field**<RootVal, Args, TType, Key\>: [Field](../modules.md#field)<RootVal, Args, TType, Key, [Context](schema.md#context)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Args` | `Args`: `Record`<string, [Arg](schema.md#arg)<any\>\> |
| `TType` | `TType`: [OutputType](schema.md#outputtype) |
| `Key` | `Key`: `string` |

#### Defined in

[schema-api.ts:18](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L18)

___

### FieldResolver

Ƭ **FieldResolver**<RootVal, Args, TType\>: [FieldResolver](../modules.md#fieldresolver)<RootVal, Args, TType, [Context](schema.md#context)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Args` | `Args`: `Record`<string, [Arg](schema.md#arg)<any\>\> |
| `TType` | `TType`: [OutputType](schema.md#outputtype) |

#### Defined in

[schema-api.ts:24](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L24)

___

### InferValueFromArg

Ƭ **InferValueFromArg**<TArg\>: [InferValueFromInputType](schema.md#infervaluefrominputtype)<`TArg`[``"type"``]\> \| ``"non-null"`` extends `TArg`[``"type"``][``"kind"``] ? `never` : `undefined` extends `TArg`[``"defaultValue"``] ? `undefined` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TArg` | `TArg`: [Arg](schema.md#arg)<any, any\> |

#### Defined in

[api-without-context/input.ts:63](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L63)

___

### InferValueFromArgs

Ƭ **InferValueFromArgs**<Args\>: { readonly[Key in keyof Args]: InferValueFromArg<Args[Key]\>}

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Args` | `Args`: `Record`<string, [Arg](schema.md#arg)<any, any\>\> |

#### Defined in

[api-without-context/input.ts:59](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L59)

___

### InferValueFromInputType

Ƭ **InferValueFromInputType**<Type\>: `Type` extends `InputNonNullTypeForInference`<infer Value\> ? `InferValueFromInputTypeWithoutAddingNull`<Value\> : `InferValueFromInputTypeWithoutAddingNull`<Type\> \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | `Type`: [InputType](schema.md#inputtype) |

#### Defined in

[api-without-context/input.ts:71](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L71)

___

### InferValueFromOutputType

Ƭ **InferValueFromOutputType**<Type\>: `MaybePromise`<`Type` extends `OutputNonNullType`<infer Value\> ? `InferValueFromOutputTypeWithoutAddingNull`<Value\> : `InferValueFromOutputTypeWithoutAddingNull`<Type\> \| ``null``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | `Type`: [OutputType](../modules.md#outputtype)<any\> |

#### Defined in

[output.ts:82](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/output.ts#L82)

___

### InputObjectType

Ƭ **InputObjectType**<Fields\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Fields` | `Fields`: { [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType\>\>} |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `unknown`) => `void` |
| `__fields` | `Fields` |
| `graphQLType` | `GraphQLInputObjectType` |
| `kind` | ``"input"`` |

#### Defined in

[api-without-context/input.ts:76](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L76)

___

### InputType

Ƭ **InputType**: [NullableInputType](schema.md#nullableinputtype) \| `InputNonNullType`

#### Defined in

[api-without-context/input.ts:44](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L44)

___

### InterfaceField

Ƭ **InterfaceField**<Args, TType\>: [InterfaceField](../modules.md#interfacefield)<Args, TType, [Context](schema.md#context)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Args` | `Args`: `Record`<string, [Arg](schema.md#arg)<any\>\> |
| `TType` | `TType`: [OutputType](schema.md#outputtype) |

#### Defined in

[schema-api.ts:38](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L38)

___

### InterfaceType

Ƭ **InterfaceType**<RootVal, Fields\>: [InterfaceType](../modules.md#interfacetype)<RootVal, Fields, [Context](schema.md#context)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RootVal` | `RootVal` |
| `Fields` | `Fields`: `Record`<string, [InterfaceField](../modules.md#interfacefield)<any, [OutputType](schema.md#outputtype), [Context](schema.md#context)\>\> |

#### Defined in

[schema-api.ts:31](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L31)

___

### ListType

Ƭ **ListType**<Of\>: `Object`

Wraps any `@ts-gql/schema` GraphQL type with in a list type.

See the documentation for [`schema.list`](schema.md#list) for more information.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Of` | `Of`: [Type](../modules.md#type)<any\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | `Of`[``"__context"``] |
| `graphQLType` | `GraphQLList`<`Of`[``"graphQLType"``]\> |
| `kind` | ``"list"`` |
| `of` | `Of` |

#### Defined in

[api-without-context/list-and-non-null.ts:9](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/list-and-non-null.ts#L9)

___

### NonNullType

Ƭ **NonNullType**<Of\>: `Object`

Wraps any nullable `@ts-gql/schema` GraphQL type with a non-null type.

See the documentation for [`schema.nonNull`](schema.md#nonnull) for more information.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Of` | `Of`: [NullableType](../modules.md#nullabletype)<any\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | `Of`[``"__context"``] |
| `graphQLType` | `GraphQLNonNull`<`Of`[``"graphQLType"``]\> |
| `kind` | ``"non-null"`` |
| `of` | `Of` |

#### Defined in

[api-without-context/list-and-non-null.ts:86](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/list-and-non-null.ts#L86)

___

### NullableInputType

Ƭ **NullableInputType**: [ScalarType](schema.md#scalartype)<any\> \| [InputObjectType](schema.md#inputobjecttype)<any\> \| `InputListType` \| [EnumType](schema.md#enumtype)<any\>

#### Defined in

[api-without-context/input.ts:38](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L38)

___

### NullableOutputType

Ƭ **NullableOutputType**: [NullableOutputType](../modules.md#nullableoutputtype)<[Context](schema.md#context)\>

#### Defined in

[schema-api.ts:16](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L16)

___

### NullableType

Ƭ **NullableType**: [NullableType](../modules.md#nullabletype)<[Context](schema.md#context)\>

#### Defined in

[schema-api.ts:14](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L14)

___

### ObjectType

Ƭ **ObjectType**<RootVal\>: [ObjectType](../modules.md#objecttype)<RootVal, [Context](schema.md#context)\>

#### Type parameters

| Name |
| :------ |
| `RootVal` |

#### Defined in

[schema-api.ts:29](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L29)

___

### OutputType

Ƭ **OutputType**: [OutputType](../modules.md#outputtype)<[Context](schema.md#context)\>

#### Defined in

[schema-api.ts:17](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L17)

___

### ScalarType

Ƭ **ScalarType**<Type\>: `Object`

A scalar type for `@ts-gql/schema` which wraps an underlying graphql-js
`GraphQLScalarType` with an type representing the deserialized form of the scalar.

**`example`**
  declare const someScalar: ScalarType<string>;

  // for fields on output types
  schema.field({ type: someScalar });

  // for args on output fields or fields on input types
  schema.arg({ type: someScalar });

#### Type parameters

| Name | Description |
| :------ | :------ |
| `Type` | The type of a value of the scalar |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__context` | (`context`: `unknown`) => `void` |
| `__type` | `Type` |
| `graphQLType` | `GraphQLScalarType` |
| `kind` | ``"scalar"`` |

#### Defined in

[api-without-context/scalars.ts:25](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L25)

___

### Type

Ƭ **Type**: [Type](../modules.md#type)<[Context](schema.md#context)\>

#### Defined in

[schema-api.ts:15](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L15)

___

### UnionType

Ƭ **UnionType**<RootVal\>: [UnionType](../modules.md#uniontype)<RootVal, [Context](schema.md#context)\>

#### Type parameters

| Name |
| :------ |
| `RootVal` |

#### Defined in

[schema-api.ts:30](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/schema-api.ts#L30)

## Variables

### Boolean

• `Const` **Boolean**: [ScalarType](schema.md#scalartype)<boolean\>

#### Defined in

[api-without-context/scalars.ts:60](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L60)

___

### Float

• `Const` **Float**: [ScalarType](schema.md#scalartype)<number\>

#### Defined in

[api-without-context/scalars.ts:58](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L58)

___

### ID

• `Const` **ID**: [ScalarType](schema.md#scalartype)<string\>

#### Defined in

[api-without-context/scalars.ts:56](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L56)

___

### Int

• `Const` **Int**: [ScalarType](schema.md#scalartype)<number\>

#### Defined in

[api-without-context/scalars.ts:59](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L59)

___

### String

• `Const` **String**: [ScalarType](schema.md#scalartype)<string\>

#### Defined in

[api-without-context/scalars.ts:57](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L57)

___

### field

• **field**: `FieldFunc`<unknown\>

___

### fields

• **fields**: `FieldsFunc`<unknown\>

___

### interface

• **interface**: `InterfaceTypeFunc`<unknown\>

___

### interfaceField

• **interfaceField**: `InterfaceFieldFunc`<unknown\>

___

### object

• **object**: `ObjectTypeFunc`<unknown\>

___

### union

• **union**: `UnionTypeFunc`<unknown\>

## Functions

### arg

▸ **arg**<Type, DefaultValue\>(`arg`): [Arg](schema.md#arg)<Type, DefaultValue\>

Creates a [`@ts-gql/schema` GraphQL argument](schema.md#arg).

Args can can be used as arguments on output fields:

```ts
schema.field({
  type: schema.String,
  args: {
    something: schema.arg({ type: schema.String }),
  },
  resolve(rootVal, { something }) {
    return something || somethingElse;
  },
});
// ==
graphql`(something: String): String`;
```

Or as fields on input objects:

```ts
const Something = schema.inputObject({
  name: "Something",
  fields: {
    something: schema.arg({ type: schema.String }),
  },
});
// ==
graphql`
  input Something {
    something: String
  }
`;
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | `Type`: [InputType](schema.md#inputtype) |
| `DefaultValue` | `DefaultValue`: `any` = `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | { `deprecationReason?`: `string` ; `description?`: `string` ; `type`: `Type`  } & `DefaultValue` extends `undefined` ? { `defaultValue?`: `DefaultValue`  } : { `defaultValue`: `DefaultValue`  } |

#### Returns

[Arg](schema.md#arg)<Type, DefaultValue\>

#### Defined in

[api-without-context/input.ts:164](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L164)

___

### enum

▸ **enum**<Values\>(`config`): [EnumType](schema.md#enumtype)<Values\>

Creates a GraphQL enum to be used within a schema created within `@ts-gql/schema`

```ts
const MyEnum = schema.enum({
  name: "MyEnum",
  values: schema.enumValues(["a", "b"]),
});
// ==
graphql`
  enum MyEnum {
    a
    b
  }
`;
```
---
```ts
const MyEnum = schema.enum({
  name: "MyEnum",
  description: "My enum does things",
  values: {
    something: {
      description: "something something",
      value: "something",
    },
    thing: {
      description: "thing thing",
      deprecationReason: "something should be used instead of thing",
      value: "thing",
    },
  },
});
// ==
graphql`
  """
  My enum does things
  """
  enum MyEnum {
    """
    something something
    """
    something
    """
    thing thing
    """
    thing ​@deprecated(reason: "something should be used instead of thing")
  }
`;
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Values` | `Values`: `Record`<string, [EnumValue](schema.md#enumvalue)<any\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Object` |
| `config.description?` | `string` |
| `config.extensions?` | `Readonly`<GraphQLEnumTypeExtensions\> |
| `config.name` | `string` |
| `config.values` | `Values` |

#### Returns

[EnumType](schema.md#enumtype)<Values\>

#### Defined in

[api-without-context/enum.ts:125](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/enum.ts#L125)

___

### enumValues

▸ **enumValues**<Values\>(`values`): `Record`<`Values`[`number`], [EnumValue](schema.md#enumvalue)<`Values`[`number`]\>\>

A shorthand to easily create enum values to pass to `schema.enum`.

If you need to set a `description` or `deprecationReason` for an enum
variant, you should pass values directly to `schema.enum` without using
`schema.enumValues`.

```ts
const MyEnum = schema.enum({
  name: "MyEnum",
  values: schema.enumValues(["a", "b"]),
});
```
---
```ts
const values = schema.enumValues(["a", "b"]);

assertDeepEqual(values, {
  a: { value: "a" },
  b: { value: "b" },
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Values` | `Values`: readonly `string`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | readonly [...Values] |

#### Returns

`Record`<`Values`[`number`], [EnumValue](schema.md#enumvalue)<`Values`[`number`]\>\>

#### Defined in

[api-without-context/enum.ts:68](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/enum.ts#L68)

___

### inputObject

▸ **inputObject**<Fields\>(`config`): [InputObjectType](schema.md#inputobjecttype)<Fields\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Fields` | `Fields`: `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Object` |
| `config.description?` | `string` |
| `config.fields` | () => `Fields` \| `Fields` |
| `config.name` | `string` |

#### Returns

[InputObjectType](schema.md#inputobjecttype)<Fields\>

#### Defined in

[api-without-context/input.ts:182](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/input.ts#L182)

___

### list

▸ **list**<Of\>(`of`): [ListType](schema.md#listtype)<Of\>

Wraps any `@ts-gql/schema` GraphQL type in a list.

```ts
const stringListType = schema.list(schema.String);
// ==
graphql`[String]`;
```

When used as an input type, you will recieve an array of the inner type.

```ts
schema.field({
  type: schema.String,
  args: { thing: schema.arg({ type: schema.list(schema.String) }) },
  resolve(rootVal, { thing }) {
    const theThing: undefined | null | Array<string | null> = thing;
    return "";
  },
});
```

When used as an output type, you can return an iterable of the inner type
that also matches `typeof val === 'object'` so for example, you'll probably
return an Array most of the time but you could also return a Set you couldn't
return a string though, even though a string is an iterable, it doesn't match
`typeof val === 'object'`.

```ts
schema.field({
  type: schema.list(schema.String),
  resolve() {
    return [""];
  },
});
```

```ts
schema.field({
  type: schema.list(schema.String),
  resolve() {
    return new Set([""]);
  },
});
```

```ts
schema.field({
  type: schema.list(schema.String),
  resolve() {
    // this will not be allowed
    return "some things";
  },
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Of` | `Of`: [Type](../modules.md#type)<any\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `of` | `Of` |

#### Returns

[ListType](schema.md#listtype)<Of\>

#### Defined in

[api-without-context/list-and-non-null.ts:72](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/list-and-non-null.ts#L72)

___

### nonNull

▸ **nonNull**<Of\>(`of`): [NonNullType](schema.md#nonnulltype)<Of\>

Wraps any nullable `@ts-gql/schema` GraphQL type with a non-null type.

Types in GraphQL are always nullable by default so if you want

```ts
const nonNullableString = schema.nonNull(schema.String);
// ==
graphql`String!`;
```

When using a non-null type as an input type, your resolver will never recieve
null and consumers of your GraphQL API **must** provide a value for it unless
you provide a default value.

```ts
schema.field({
  args: {
    someNonNullAndRequiredArg: schema.arg({
      type: schema.nonNull(schema.String),
    }),
    someNonNullButOptionalArg: schema.arg({
      type: schema.nonNull(schema.String),
      defaultValue: "some default",
    }),
  },
  type: schema.String,
  resolve(rootVal, args) {
    // both of these will always be a string
    args.someNonNullAndRequiredArg;
    args.someNonNullButOptionalArg;

    return "";
  },
});
// ==
graphql`
  fieldName(
    someNonNullAndRequiredArg: String!
    someNonNullButOptionalArg: String! = "some default"
  ): String
`;
```

When using a non-null type as an output type, your resolver must never return
null. If you do return null(which unless you do type-casting/ts-ignore/etc.
`@ts-gql/schema` will not let you do) graphql-js will return an error to
consumers of your GraphQL API.

Non-null types should be used very carefully on output types. If you have to
do a fallible operation like a network request or etc. to get the value, it
probably shouldn't be non-null. If you make a field non-null and doing the
fallible operation fails, consumers of your GraphQL API will be unable to see
any of the other fields on the object that the non-null field was on. For
example, an id on some type is a good candidate for being non-null because if
you have the entity, you will already have the id so getting the id will
never fail but fetching a related entity from a database would be fallible so
even if it will never be null in the success case, you should make it nullable.

```ts
schema.field({
  type: schema.nonNull(schema.String),
  resolve(rootVal, args) {
    return "something";
  },
});
// ==
graphql`
  fieldName: String!
`;
```

If you try to wrap another non-null type in a non-null type again, you will
get a type error.

```ts
// Argument of type 'NonNullType<ScalarType<string>>'
// is not assignable to parameter of type 'TypesExcludingNonNull'.
schema.nonNull(schema.nonNull(schema.String));
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Of` | `Of`: [NullableType](../modules.md#nullabletype)<any\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `of` | `Of` |

#### Returns

[NonNullType](schema.md#nonnulltype)<Of\>

#### Defined in

[api-without-context/list-and-non-null.ts:174](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/list-and-non-null.ts#L174)

___

### scalar

▸ **scalar**<Type\>(`scalar`): [ScalarType](schema.md#scalartype)<Type\>

Creates a `@ts-gql/schema` scalar type from a graphql-js scalar.

You should provide a type as a type parameter which is the type of the scalar
value. Note, while graphql-js allows you to express scalar types like the
`ID` type which accepts integers and strings as both input values and return
values from resolvers which are transformed into strings before calling
resolvers and returning the query respectively, the type you use should be
`string` for `ID` since that is what it is transformed into. `@ts-gql/schema`
doesn't currently express the coercion of scalars, you should instead convert
values to the canonical form yourself before returning from resolvers.

**`example`**
  const JSON = schema.scalar<JSONValue>(GraphQLJSON);

#### Type parameters

| Name |
| :------ |
| `Type` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `scalar` | `GraphQLScalarType` |

#### Returns

[ScalarType](schema.md#scalartype)<Type\>

#### Defined in

[api-without-context/scalars.ts:47](https://github.com/Thinkmill/graphql-ts/blob/b428d80/packages/schema/src/api-without-context/scalars.ts#L47)
