import { style } from "@vanilla-extract/css";
import { tokens } from "../lib/theme.css";

export const header = style({
  fontSize: "2rem",
  fontWeight: 400,
  padding: "1rem",
  color: tokens.color.gray800,
  backgroundColor: tokens.color.gray100,
  borderBottom: `1px solid ${tokens.color.gray300}`,
  marginBottom: "1rem",
});
