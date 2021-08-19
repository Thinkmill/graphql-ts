import { style } from "@vanilla-extract/css";
import { tokens } from "./theme.css";

export const header = style({
  fontSize: "2rem",
  padding: "1rem",
  borderBottom: `1px solid #333`,
  marginBottom: "1rem",
});
