import { style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const header = style({
  fontSize: "2rem",
  fontWeight: 400,
  padding: "1rem",
  color: tokens.color.gray800,
  backgroundColor: tokens.color.gray100,
  borderBottom: `1px solid ${tokens.color.gray300}`,
});

export const pageContainer = style({
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
});

export const navigationContainer = style({
  padding: "16px 24px 16px 16px",
  borderRight: `1px solid ${tokens.color.gray100}`,
  marginRight: 16,
  width: 360,
});

export const contents = style({
  padding: 16,
});
