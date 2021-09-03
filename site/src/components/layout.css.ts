import { style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const header = style({
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  padding: "1rem",
  backgroundColor: tokens.color.gray50,
  borderBottom: `1px solid ${tokens.color.gray300}`,
});

export const headerHeading = style({
  fontSize: "2rem",
  fontWeight: 400,
  color: tokens.color.gray800,
});

export const headerSearch = style({
  minWidth: 420,
});

export const pageContainer = style({
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
});

export const navigationContainer = style({
  padding: "16px 24px 16px 16px",
  flex: 1,
  minWidth: 280,
  top: 0,
  position: "sticky",
  overflowY: "auto",
  height: "100vh",
});

export const contents = style({
  padding: 16,
  paddingLeft: 0,
  flex: 4,
});
