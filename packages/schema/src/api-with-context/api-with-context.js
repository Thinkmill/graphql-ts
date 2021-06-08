import { bindSchemaAPIToContext } from "../output";

const __schema = bindSchemaAPIToContext();

export const { field, fields, interfaceField, object, union } = __schema;

const interfaceType = __schema.interface;

export { interfaceType as interface };
