import { g } from "@graphql-ts/schema";

export const {
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
} = g;

const enumType = g.enum;

export { enumType as enum };
