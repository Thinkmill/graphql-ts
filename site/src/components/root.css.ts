import { style } from "@vanilla-extract/css";
import { colors } from "../lib/theme.css";

export const versionSelect = style({
  border: `2px solid ${colors.blueGray400}`,
  borderRadius: 4,
  width: "100%",
  background: colors.blueGray200,
  WebkitAppearance: "none",
  padding: 4,
  paddingLeft: 8,
  marginBottom: 4,
});

export const versionSelectChevron = style({
  position: "absolute",
  top: 1,
  right: 8,
  pointerEvents: "none",
});

export const versionSelectWrapper = style({
  position: "relative",
});
