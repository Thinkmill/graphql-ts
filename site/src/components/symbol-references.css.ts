import { composeStyles, globalStyle, style } from "@vanilla-extract/css";
import { codeFont, syntaxColors } from "../lib/theme.css";
import { targetBackground } from "./symbol.css";

export const symbolName = composeStyles(
  codeFont,
  targetBackground,
  style({
    color: syntaxColors.symbol,
    ":hover": { textDecoration: "underline" },
  })
);

export const unknownExternalReference = composeStyles(
  codeFont,
  style({
    color: "#f92672",
  })
);

const baseSymbolReference = style({
  ":hover": { textDecoration: "underline" },
});

export const rootSymbolReference = composeStyles(
  codeFont,
  baseSymbolReference,
  style({
    color: syntaxColors.string,
  })
);

export const nonRootSymbolReference = composeStyles(
  codeFont,
  baseSymbolReference,
  style({
    color: syntaxColors.symbol,
  })
);

export const tooltipMarkdownContent = style({});

globalStyle(`${tooltipMarkdownContent} :last-child`, { marginBottom: 0 });

globalStyle(`${tooltipMarkdownContent} *`, {
  color: "inherit !important",
});
