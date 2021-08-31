import { composeStyles, globalStyle, style } from "@vanilla-extract/css";
import { codeFont, syntaxColors, codeFontStyleObj } from "../lib/theme.css";
import { targetBackground } from "./symbol.css";

const baseSymbol = {
  ":hover": { textDecoration: "underline" },
};

export const symbolName = composeStyles(
  codeFont,
  targetBackground,
  style({
    color: syntaxColors.symbol,
    ...baseSymbol,
  })
);

export const unknownExternalReference = composeStyles(
  codeFont,
  style({
    color: "#f92672",
  })
);

export const rootSymbolReference = style({
  color: syntaxColors.string,
  ...codeFontStyleObj,
  ...baseSymbol,
});

export const nonRootSymbolReference = style({
  color: syntaxColors.symbol,
  ...codeFontStyleObj,
  ...baseSymbol,
});

export const tooltipMarkdownContent = style({});

globalStyle(`${tooltipMarkdownContent} :last-child`, { marginBottom: 0 });

globalStyle(`${tooltipMarkdownContent} *`, {
  color: "inherit !important",
});
