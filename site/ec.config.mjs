import { defineEcConfig } from "@astrojs/starlight/expressive-code";
import ecTwoSlash from "expressive-code-twoslash";

export default defineEcConfig({
  plugins: [
    ecTwoSlash({
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
          if (lines[lines.length - 1].text === "") {
            context.codeBlock.deleteLine(lines.length - 1);
          }
        },
      },
    },
  ],
});
