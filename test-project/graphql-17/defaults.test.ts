import assert from "node:assert/strict";
import test from "node:test";
import { gWithContext } from "@graphql-ts/schema";
import { GraphQLSchema, graphql, versionInfo } from "graphql";

test(
  "native defaults are coerced before reaching resolvers",
  {
    skip: versionInfo.major < 17,
  },
  async () => {
    const g = gWithContext();
    const mode = g.enum({
      name: "Mode",
      values: { FAST: { value: 42 } },
    });
    const options = g.inputObject({
      name: "Options",
      fields: {
        mode: g.arg({ type: mode, default: { value: "FAST" } }),
        numbers: g.arg({
          type: g.list(g.Int),
          default: { value: new Set([1, 2]) },
        }),
        label: g.arg({ type: g.String }),
      },
    });
    const query = g.object()({
      name: "Query",
      fields: {
        inspect: g.field({
          type: g.String,
          args: {
            options: g.arg({ type: options, default: { value: {} } }),
            literal: g.arg({
              type: g.Int,
              default: { literal: { kind: "IntValue", value: "7" } },
            }),
          },
          resolve(_, args) {
            assert.equal(args.options?.mode, 42);
            assert.deepEqual(args.options?.numbers, [1, 2]);
            assert.equal(args.options?.label, undefined);
            assert.equal(args.literal, 7);
            return "coerced";
          },
        }),
      },
    });
    const result = await graphql({
      schema: new GraphQLSchema({ query }),
      source: "{ inspect }",
    });
    assert.deepEqual(JSON.parse(JSON.stringify(result)), {
      data: { inspect: "coerced" },
    });
  }
);
