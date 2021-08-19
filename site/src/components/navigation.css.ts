import { style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const item = style({
  paddingLeft: 16,
  paddingRight: 16,
});

export const expandable = style({
  paddingLeft: 6,
});

export const expandableContents = style({
  borderLeft: `2px solid ${tokens.color.gray400}`,
  marginLeft: 2,
  paddingLeft: 6,
  marginBottom: 8,
});

export const expandableSummary = style({
  display: "flex",
  fontWeight: "bold",
  marginBottom: 8,
  marginLeft: -16,
});

export const expandableChevron = style({
  cursor: "pointer",
  marginTop: 3,
  marginLeft: 8,
  marginRight: 3,
});
