import { gWithContext } from "@graphql-ts/schema";

const g = gWithContext<unknown>();
const arg = g.arg({ type: g.String, defaultValue: "legacy" });

console.log(arg.defaultValue);
