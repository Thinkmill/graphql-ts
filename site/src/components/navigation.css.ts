import { style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const expandable = style({
  paddingLeft: "1rem",
});

export const expandableContents = style({
  borderLeft: `0.15rem solid ${tokens.color.gray400}`,
  paddingLeft: "1rem",
  marginLeft: "1rem",
});

export const expandableSummary = style({
  display: "flex",
  fontWeight: "bold",
  marginBottom: "0.25rem",
});

export const expandableChevron = style({
  cursor: "pointer",
  marginLeft: "0.45rem",
  marginRight: "0.45rem",
});
