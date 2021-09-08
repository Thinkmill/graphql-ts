import {
  NullableInputType,
  NullableOutputType,
  NonNullType,
  InputType,
  OutputType,
} from ".";
import { list, nonNull } from "./api-without-context/list-and-non-null";

export type __toMakeTypeScriptEmitImportsForItemsOnlyUsedInJSDoc = [
  InputType,
  OutputType<any>,
  typeof list,
  typeof nonNull
];

/**
 * Any **nullable** GraphQL type for a given `Context`.
 *
 * You generally won't need this because you'll likely want a nullable
 * {@link NullableInputType input} or {@link NullableOutputType output} type but
 * there are some uses cases for it like {@link nonNull `graphql.nonNull`}.
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
 * Any GraphQL type for a given `Context`.
 *
 * Note that this includes both **input and output** types.
 *
 * You generally won't need this because you'll likely want an
 * {@link InputType input} or {@link InputType output} type but there are some
 * uses cases for it like {@link list `graphql.list`}.
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
