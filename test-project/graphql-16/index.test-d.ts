import { gWithContext } from "@graphql-ts/schema";

const g = gWithContext<unknown>();

g.arg({
  type: g.String,
  // @ts-expect-error `default` was added in GraphQL 17
  default: { value: "external input" },
});
