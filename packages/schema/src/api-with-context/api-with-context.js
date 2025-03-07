import { initG } from "../output";

const __graphql = initG();

export const { field, fields, interfaceField, object, union } = __graphql;

const interfaceType = __graphql.interface;

export { interfaceType as interface };
