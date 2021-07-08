import {
  NullableInputType,
  NullableOutputType,
  NonNullType,

  // (these are referenced in the docs)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InputType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  OutputType,
} from ".";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { list, nonNull } from "./api-without-context/list-and-non-null";

/**
 * Any nullable `@graphql-ts/schema` GraphQL type for a given `Context`.
 *
 * This won't generally be used but is used as the argument for
 * {@link nonNull `schema.nonNull`}.
 *
 * See also:
 *
 * - {@link Type}
 * - {@link InputType}
 * - {@link OutputType}
 */
export type NullableType<Context> =
  | NullableInputType
  | NullableOutputType<Context>;

/**
 * Any `@graphql-ts/schema` GraphQL type for a given `Context`.
 *
 * Note that this includes both **input and output** types.
 *
 * You generally won't need this because you'll likely want an
 * {@link InputType input} or {@link InputType output} type but
 * {@link list `schema.list`} is an example of a use case for this.
 *
 * See also:
 *
 * - {@link InputType}
 * - {@link OutputType}
 * - {@link NullableType}
 */
export type Type<Context> =
  | NullableType<Context>
  | NonNullType<NullableType<Context>>;
