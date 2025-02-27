import type { InputType, NullableInputType } from "./api-without-context/input";
import type {
  list,
  nonNull,
  NonNullType,
} from "./api-without-context/list-and-non-null";
import type { NullableOutputType, OutputType } from "./output";

export type __toMakeTypeScriptEmitImportsForItemsOnlyUsedInJSDoc = [
  InputType,
  OutputType<any>,
  typeof list,
  typeof nonNull,
];

/**
 * Any **nullable** GraphQL type for a given `Context`.
 *
 * You generally won't need this because you'll likely want a nullable
 * {@link NullableInputType input} or {@link NullableOutputType output} type but
 * there are some uses cases for it like {@link nonNull `g.nonNull`}.
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
 * uses cases for it like {@link list `g.list`}.
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
