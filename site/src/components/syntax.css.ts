import { style } from "@vanilla-extract/css";
import { codeFontStyleObj, syntaxColors } from "../lib/theme.css";

export const syntaxKinds = {
  parameter: style({ color: syntaxColors.parameter, ...codeFontStyleObj }),
  keyword: style({ color: syntaxColors.keyword, ...codeFontStyleObj }),
  bracket: style({ color: syntaxColors.bracket, ...codeFontStyleObj }),
  colon: style({ color: syntaxColors.colon, ...codeFontStyleObj }),
  comma: style({ color: syntaxColors.comma, ...codeFontStyleObj }),
  string: style({ color: syntaxColors.string, ...codeFontStyleObj }),
};
