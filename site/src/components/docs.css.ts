import { composeStyles, style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const docs = style({
  borderLeft: `2px solid ${tokens.color.emerald200}`,
  paddingLeft: 16,
  marginTop: 16,
  marginBottom: 16,
});

const expandLink = style({
  display: "flex",
  cursor: "pointer",
  margin: "8px 0 16px",

  ":hover": {
    textDecoration: "underline",
  },
});

export const expandLinkOpen = composeStyles(
  expandLink,
  style({
    color: tokens.color.emerald500,
  })
);

export const expandLinkClose = composeStyles(
  expandLink,
  style({
    color: tokens.color.emerald700,
  })
);

export const expandIcon = style({
  marginTop: 5,
  marginRight: 5,
  width: 16,
  height: 16,
});
