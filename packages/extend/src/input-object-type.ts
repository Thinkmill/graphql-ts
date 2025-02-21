// TODO: remove when a breaking change necessitates bumping the peer dep requirement of @graphql-ts/schema

import type {
  InputObjectType as _InputObjectType,
  Arg,
  InputType,
} from "@graphql-ts/schema";

/**
 * This type exists purely for backwards compatibility reasons. You should use
 * {@link _InputObjectType `InputObjectType`} instead.
 */
export type InputObjectType<
  Fields extends { [key: string]: Arg<InputType> },
  IsOneOf extends boolean
> = Omit<_InputObjectType<Fields>, "isOneOf"> & { isOneOf: IsOneOf };
