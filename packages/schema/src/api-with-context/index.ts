/**
 * @module
 * @deprecated This entrypoint should no longer be used. Use {@link initG}
 *   instead.
 */
import { initG } from "@graphql-ts/schema";
const {
  field,
  fields,
  interface: interfaceType,
  interfaceField,
  object,
  union,
} = initG<unknown>();
export {
  field,
  fields,
  interfaceType as interface,
  interfaceField,
  object,
  union,
};
