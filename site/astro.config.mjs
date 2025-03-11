import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import esbuild from "esbuild";
import * as graphql from "graphql";
import graphqlTsSchemaDefault, * as _graphqlTsSchema from "@graphql-ts/schema";
import tailwindcss from "@tailwindcss/vite";
import "mdast-util-mdx-jsx";

const graphqlTsSchema = graphqlTsSchemaDefault || _graphqlTsSchema;

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "graphql-ts",
      social: { github: "https://github.com/Thinkmill/graphql-ts" },
      customCss: ["./src/index.css"],
      components: {
        Hero: "./src/Hero.astro",
      },
      sidebar: [
        {
          label: "Get Started",
          items: [{ slug: "installation", label: "Installation" }],
        },
        {
          label: "Types",
          autogenerate: { directory: "types" },
        },
        {
          label: "Examples",
          autogenerate: { directory: "examples" },
        },
        {
          label: "Extra",
          items: [
            // { label: "Design", link: "/design" },
            { label: "Schema Extension", link: "/extend" },
          ],
        },
        {
          label: "API Reference",
          items: [
            {
              label: "@graphql-ts/schema",
              link: "https://docsmill.dev/npm/@graphql-ts/schema",
            },
            {
              label: "@graphql-ts/extend",
              link: "https://docsmill.dev/npm/@graphql-ts/extend",
            },
          ],
        },
      ],
    }),
  ],

  markdown: {
    remarkPlugins: [
      () => (tree, file) => {
        /** @param {import("mdast").Nodes} node */
        function visitNode(node) {
          if (node.type === "mdxJsxFlowElement" && node.name === "ShowSchema") {
            const code = node.children.find(
              (child) => child.type === "code"
            )?.value;
            if (!code) {
              throw new Error("Expected code block inside <ShowSchema>");
            }
            let compiledCode;
            try {
              compiledCode = esbuild.transformSync(
                "\n".repeat(node.position?.start.line ?? 0) + code,
                { format: "cjs", loader: "ts", sourcefile: file.path }
              ).code;
            } catch (e) {
              console.error(e);
              throw new Error(`Failed to compile schema:\n${code}`, {
                cause: e,
              });
            }
            const requireForCode = (/** @type {string} */ mod) => {
              if (mod === "graphql") {
                return graphql;
              }
              if (mod === "@graphql-ts/schema") {
                return graphqlTsSchema;
              }
              throw new Error(`Unexpected require('${mod}')`);
            };
            const func = new Function(
              "require",
              "module",
              compiledCode + "\n;return schema"
            );
            let schema;
            try {
              schema = func(requireForCode, { exports: {} });
            } catch (e) {
              console.error(e);
              throw new Error(
                `Failed to create schema from compiled code:\n${compiledCode}`,
                { cause: e }
              );
            }
            node.attributes.push({
              type: "mdxJsxAttribute",
              name: "schema",
              value: graphql.printSchema(schema),
            });
          }

          if ("children" in node && node.children) {
            node.children.forEach(visitNode);
          }
        }
        tree.children.forEach(visitNode);
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
