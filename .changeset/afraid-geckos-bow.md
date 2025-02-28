---
"@graphql-ts/schema": major
---

The following types are now deprecated and have replacements as follows:

- `ObjectType` -> `GObjectType`
- `EnumType` -> `GEnumType`
- `ScalarType` -> `GScalarType`
- `InputObjectType` -> `GInputObjectType`
- `InterfaceType` -> `GInterfaceType`
- `UnionType` -> `GUnionType`
- `ListType` -> `GList`
- `NonNullType` -> `GNonNull`
- `Arg` -> `GArg`
- `Field` -> `GField`
- `FieldResolver` -> `GFieldResolver`
- `InterfaceField` -> `GInterfaceField`
- `NullableInputType` -> `GNullableInputType`
- `NullableOutputType` -> `GNullableOutputType`
- `NullableType` -> `GNullableType`
- `InputType` -> `GInputType`
- `OutputType` -> `GOutputType`
- `Type` -> `GType`

They are all exactly adding `G` before the previous name except for `ListType` and `NonNullType` which are now `GList` and `GNonNull` respectively without `Type` at the end.
