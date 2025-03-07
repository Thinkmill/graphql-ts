import { initG } from "../output";

const __graphql = initG();

export const {
  field,
  fields,
  interfaceField,
  object,
  union,
  Boolean,
  Float,
  ID,
  Int,
  String,
  arg,
  enumValues,
  inputObject,
  list,
  nonNull,
  scalar,
} = __graphql;

const interfaceType = __graphql.interface;
const enumType = __graphql.enum;

export { interfaceType as interface, enumType as enum };
