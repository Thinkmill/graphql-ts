import { initG } from "../output";

const g = initG();

export const { field, fields, interfaceField, object, union } = g;

const interfaceType = g.interface;

export { interfaceType as interface };
