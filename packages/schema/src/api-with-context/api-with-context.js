import { g } from "@graphql-ts/schema";

export const { field, fields, interfaceField, object, union } = g;

const interfaceType = g.interface;

export { interfaceType as interface };
