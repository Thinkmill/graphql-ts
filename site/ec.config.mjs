import { defineEcConfig } from "@astrojs/starlight/expressive-code";
import ecTwoSlash from "expressive-code-twoslash";

export default defineEcConfig({
  themes: ["github-dark", "github-light"],
  plugins: [
    ecTwoSlash({
      // including the jsdoc makes the table of contents include the headings from the table of contents
      includeJsDoc: false,
      twoslashOptions: {
        compilerOptions: {
          lib: undefined,
        },
      },
    }),
    {
      name: "remove-trailing-empty-line",
      hooks: {
        preprocessCode(context) {
          const lines = context.codeBlock.getLines();
          if (lines[lines.length - 1]?.text === "") {
            context.codeBlock.deleteLine(lines.length - 1);
          }
        },
      },
    },
  ],
});
