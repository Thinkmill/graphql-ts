import { composeStyles, style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const docs = style({
  borderLeft: `2px solid ${tokens.color.emerald200}`,
  paddingLeft: 16,
  marginTop: 16,
  marginBottom: 16,
});

export const blockSummary = style({
  display: "block",
  selectors: {
    "&::-webkit-details-marker": {
      display: "none",
    },
  },
});

export const details = composeStyles(
  docs,
  style({
    selectors: {
      "&[open]": {
        position: "relative",
        paddingBottom: 32,
      },
    },
  })
);

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
    selectors: {
      "details[open] > summary > &": {
        display: "none",
      },
    },
  })
);

export const expandLinkClose = composeStyles(
  expandLink,
  style({
    color: tokens.color.emerald700,
    position: "absolute",
    bottom: -12,
    selectors: {
      ":not(details[open]) > summary > &": {
        display: "none",
      },
    },
  })
);

export const expandIcon = style({
  marginTop: 5,
  marginRight: 5,
  width: 16,
  height: 16,
});
