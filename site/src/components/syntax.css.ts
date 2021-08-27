import { style } from "@vanilla-extract/css";
import { syntaxColors } from "../lib/theme.css";

export const syntaxKinds = {
  parameter: style({ color: syntaxColors.parameter }),
  keyword: style({ color: syntaxColors.keyword }),
  bracket: style({ color: syntaxColors.bracket }),
  colon: style({ color: syntaxColors.colon }),
  comma: style({ color: syntaxColors.comma }),
  string: style({ color: syntaxColors.string }),
};
