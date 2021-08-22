import { composeStyles, style } from "@vanilla-extract/css";
import { codeFont, tokens } from "../lib/theme.css";

export const moduleHeading = composeStyles(
  codeFont,
  style({
    fontSize: "2rem",
    marginBottom: 16,
  })
);

export const symbolHeading = composeStyles(
  codeFont,
  style({
    fontSize: "1.6rem",
    marginBottom: 16,
  })
);

export const rootSymbolContainer = style({
  borderBottom: `1px solid ${tokens.color.gray200}`,
  paddingBottom: 24,
  marginBottom: 16,
});

export const innerExportsHeading = composeStyles(
  codeFont,
  style({
    fontSize: "1.2rem",
    fontWeight: 500,
  })
);

export const innerExportsContainer = style({
  borderLeft: `2px solid ${tokens.color.blueGray300}`,
  marginTop: 16,
  marginBottom: 16,
  paddingLeft: 16,
});

export const referencesHeading = style({
  fontSize: "1.2rem",
  marginBottom: 16,
});

export const referencesContainer = style({
  borderBottom: `1px solid ${tokens.color.gray200}`,
  paddingBottom: 24,
  marginBottom: 16,
});

export const referenceItem = style({
  listStylePosition: "inside",
  listStyleType: "disc",
});
