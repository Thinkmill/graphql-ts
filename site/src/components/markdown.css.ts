import { composeStyles, style } from "@vanilla-extract/css";
import { codeFont, tokens } from "../lib/theme.css";

export const a = style({
  color: tokens.color.blue600,
  ":hover": {
    color: tokens.color.blue800,
    textDecoration: "underline",
  },
});

export const codeblock = composeStyles(
  codeFont,
  style({
    fontWeight: 400,
    padding: "12px",
    fontSize: "0.9rem",
    margin: "16px 16px 16px 0",
    backgroundColor: tokens.color.gray50,
    border: `1px solid ${tokens.color.gray200}`,
    borderRadius: 6,
  })
);

export const codeblockInner = style({ backgroundColor: "transparent" });
