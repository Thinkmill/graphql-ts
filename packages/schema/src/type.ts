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
 * Any **nullable** `@graphql-ts/schema` GraphQL type for a given `Context`.
 *
 * You generally won't need this because you'll likely want a nullable
 * {@link NullableInputType input} or {@link NullableOutputType output} type but
 * there are some uses cases for it like {@link nonNull `schema.nonNull`}.
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
 * {@link InputType input} or {@link InputType output} type but there are some
 * uses cases for it like {@link list `schema.list`}.
 *
 * See also:
 *
 * - {@link NullableType}
 * - {@link InputType}
 * - {@link OutputType}
 */
export type Type<Context> =
  | NullableType<Context>
  | NonNullType<NullableType<Context>>;
