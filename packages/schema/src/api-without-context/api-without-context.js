import { initG } from "../output";

const g = initG();

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
