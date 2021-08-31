import { createTheme, globalStyle, style } from "@vanilla-extract/css";

export const syntaxColors = {
  parameter: "#111111",
  symbol: "#4876d6",
  keyword: "#994cc3",
  bracket: "#403f53",
  colon: "#0c969b",
  comma: "#5f7e97",
  string: "#c96765",
};

export const colors = {
  white: "#ffffff",
  black: "#000000",

  rose50: "#fff1f2",
  rose100: "#ffe4e6",
  rose200: "#fecdd3",
  rose300: "#fda4af",
  rose400: "#fb7185",
  rose500: "#f43f5e",
  rose600: "#e11d48",
  rose700: "#be123c",
  rose800: "#9f1239",
  rose900: "#881337",
  pink50: "#fdf2f8",
  pink100: "#fce7f3",
  pink200: "#fbcfe8",
  pink300: "#f9a8d4",
  pink400: "#f472b6",
  pink500: "#ec4899",
  pink600: "#db2777",
  pink700: "#be185d",
  pink800: "#9d174d",
  pink900: "#831843",
  fuchsia50: "#fdf4ff",
  fuchsia100: "#fae8ff",
  fuchsia200: "#f5d0fe",
  fuchsia300: "#f0abfc",
  fuchsia400: "#e879f9",
  fuchsia500: "#d946ef",
  fuchsia600: "#c026d3",
  fuchsia700: "#a21caf",
  fuchsia800: "#86198f",
  fuchsia900: "#701a75",
  purple50: "#f5f3ff",
  purple100: "#ede9fe",
  purple200: "#ddd6fe",
  purple300: "#c4b5fd",
  purple400: "#a78bfa",
  purple500: "#8b5cf6",
  purple600: "#7c3aed",
  purple700: "#6d28d9",
  purple800: "#5b21b6",
  purple900: "#4c1d95",
  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo200: "#c7d2fe",
  indigo300: "#a5b4fc",
  indigo400: "#818cf8",
  indigo500: "#6366f1",
  indigo600: "#4f46e5",
  indigo700: "#4338ca",
  indigo800: "#3730a3",
  indigo900: "#312e81",
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue400: "#60a5fa",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",
  lightBlue50: "#f0f9ff",
  lightBlue100: "#e0f2fe",
  lightBlue200: "#bae6fd",
  lightBlue300: "#7dd3fc",
  lightBlue400: "#38bdf8",
  lightBlue500: "#0ea5e9",
  lightBlue600: "#0284c7",
  lightBlue700: "#0369a1",
  lightBlue800: "#075985",
  lightBlue900: "#0c4a6e",
  cyan50: "#ecfeff",
  cyan100: "#cffafe",
  cyan200: "#a5f3fc",
  cyan300: "#67e8f9",
  cyan400: "#22d3ee",
  cyan500: "#06b6d4",
  cyan600: "#0891b2",
  cyan700: "#0e7490",
  cyan800: "#155e75",
  cyan900: "#164e63",
  teal50: "#f0fdfa",
  teal100: "#ccfbf1",
  teal200: "#99f6e4",
  teal300: "#5eead4",
  teal400: "#2dd4bf",
  teal500: "#14b8a6",
  teal600: "#0d9488",
  teal700: "#0f766e",
  teal800: "#115e59",
  teal900: "#134e4a",
  emerald50: "#ecfdf5",
  emerald100: "#d1fae5",
  emerald200: "#a7f3d0",
  emerald300: "#6ee7b7",
  emerald400: "#34d399",
  emerald500: "#10b981",
  emerald600: "#059669",
  emerald700: "#047857",
  emerald800: "#065f46",
  emerald900: "#064e3b",
  green50: "#f0fdf4",
  green100: "#dcfce7",
  green200: "#bbf7d0",
  green300: "#86efac",
  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",
  green700: "#15803d",
  green800: "#166534",
  green900: "#14532d",
  yellow50: "#fefce8",
  yellow100: "#fef9c3",
  yellow200: "#fef08a",
  yellow300: "#fde047",
  yellow400: "#facc15",
  yellow500: "#eab308",
  yellow600: "#ca8a04",
  yellow700: "#a16207",
  yellow800: "#854d0e",
  yellow900: "#713f12",
  amber50: "#fffbeb",
  amber100: "#fef3c7",
  amber200: "#fde68a",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  amber600: "#d97706",
  amber700: "#b45309",
  amber800: "#92400e",
  amber900: "#78350f",
  orange50: "#fff7ed",
  orange100: "#ffedd5",
  orange200: "#fed7aa",
  orange300: "#fdba74",
  orange400: "#fb923c",
  orange500: "#f97316",
  orange600: "#ea580c",
  orange700: "#c2410c",
  orange800: "#9a3412",
  orange900: "#7c2d12",
  red50: "#fef2f2",
  red100: "#fee2e2",
  red200: "#fecaca",
  red300: "#fca5a5",
  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  red900: "#7f1d1d",
  warmGray50: "#fafaf9",
  warmGray100: "#f5f5f4",
  warmGray200: "#e7e5e4",
  warmGray300: "#d6d3d1",
  warmGray400: "#a8a29e",
  warmGray500: "#78716c",
  warmGray600: "#57534e",
  warmGray700: "#44403c",
  warmGray800: "#292524",
  warmGray900: "#1c1917",
  gray50: "#fafafa",
  gray100: "#f4f4f5",
  gray200: "#e4e4e7",
  gray300: "#d4d4d8",
  gray400: "#a1a1aa",
  gray500: "#71717a",
  gray600: "#52525b",
  gray700: "#3f3f46",
  gray800: "#27272a",
  gray900: "#18181b",
  coolGray50: "#f9fafb",
  coolGray100: "#f3f4f6",
  coolGray200: "#e5e7eb",
  coolGray300: "#d1d5db",
  coolGray400: "#9ca3af",
  coolGray500: "#6b7280",
  coolGray600: "#4b5563",
  coolGray700: "#374151",
  coolGray800: "#1f2937",
  coolGray900: "#111827",
  blueGray50: "#f8fafc",
  blueGray100: "#f1f5f9",
  blueGray200: "#e2e8f0",
  blueGray300: "#cbd5e1",
  blueGray400: "#94a3b8",
  blueGray500: "#64748b",
  blueGray600: "#475569",
  blueGray700: "#334155",
  blueGray800: "#1e293b",
  blueGray900: "#0f172a",
};

export const [themeClass, tokens] = createTheme({
  font: {
    body: `
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen-Sans,
      Ubuntu,
      Cantarell,
      'Helvetica Neue',
      sans-serif,
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji'
    `,
    code: `
      'Fira Code',
      'Source Code Pro',
      'fontFamily.mono',
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      'Liberation Mono',
      'Courier New',
      monospace
    `,
  },
  /** Palette thanks to https://yeun.github.io/open-color/ */
  color: colors,
});

export const rootStyles = style({
  fontFamily: tokens.font.body,
});

/** Our codeFont stack as a style for easy use */

export const codeFont = style({
  fontFamily: tokens.font.code,
  fontVariantLigatures: "none",
});

export const codeFontStyleObj = {
  fontFamily: tokens.font.code,
  fontVariantLigatures: "none",
};

/** Thanks for the reset, @tailwindcss (everything below here) */

globalStyle(`html`, {
  fontFamily: tokens.font.body,
  lineHeight: 1.5,
});

/** Inherit font-family and line-height from `html` */

globalStyle(`body`, {
  fontFamily: "inherit",
  lineHeight: "inherit",
});

/** Removes the default spacing and border for appropriate elements. */

globalStyle(
  `blockquote,
   dl,
   dd,
   h1,
   h2,
   h3,
   h4,
   h5,
   h6,
   hr,
   figure,
   p,
   pre`,
  {
    margin: 0,
  }
);

globalStyle(`button`, {
  backgroundColor: "transparent",
  backgroundImage: "none",
});

globalStyle(`fieldset`, {
  margin: 0,
  padding: 0,
});

globalStyle(
  `ol,
   ul`,
  {
    // listStyle: "none",
    margin: 0,
    padding: 0,
  }
);

globalStyle(`body`, {
  margin: 0,
  padding: 0,
});
/**
 * 1. Prevent padding and border from affecting element width.
 *
 *    We used to set this in the html element and inherit from the parent element
 *    for everything else. This caused issues in shadow-dom-enhanced elements
 *    like <details> where the content is wrapped by a div with box-sizing set
 *    to `content-box`.
 *
 *    https://github.com/mozdevs/cssremedy/issues/4
 * 2. Allow adding a border to an element by just adding a border-width.
 *
 *    By default, the way the browser specifies that an element should have no
 *    border is by setting it's border-style to `none` in the user-agent stylesheet.
 *
 *    In order to easily add borders to elements by just setting the `border-width`
 *    property, we change the default border-style for all elements to `solid`,
 *    and use border-width to hide them instead. This way our `border` utilities
 *    only need to set the `border-width` property instead of the entire
 *    `border` shorthand, making our border utilities much more straightforward
 *    to compose.
 *
 *    https://github.com/tailwindcss/tailwindcss/pull/116
 */

globalStyle(
  `*,
   ::before,
   ::after`,
  {
    boxSizing: "border-box" /* 1 */,
    borderWidth: 0 /* 2 */,
    borderStyle: "solid" /* 2 */,
    borderColor: "currentColor" /* 2 */,
  }
);

/*
 * Ensure horizontal rules are visible by default
 */

globalStyle(`hr`, {
  borderTopWidth: "1px",
});

/**
 * Undo the `border-style: none` reset that Normalize applies to images so that
 * our `border-{width}` utilities have the expected effect.
 *
 * The Normalize reset is unnecessary for us since we default the border-width
 * to 0 on all elements.
 *
 * https://github.com/tailwindcss/tailwindcss/issues/362
 */

globalStyle(`img`, {
  borderStyle: "solid",
});

globalStyle(`textarea`, {
  resize: "vertical",
});

globalStyle(
  `input::placeholder,
   textarea::placeholder`,
  {
    opacity: 1,
    color: tokens.color.gray400,
  }
);

globalStyle(
  `button,
   [role="button"]`,
  {
    cursor: "pointer",
  }
);

/**
 * Override legacy focus reset from Normalize with modern Firefox focus styles.
 *
 * This is actually an improvement over the new defaults in Firefox in our
 * testing, as it triggers the better focus styles even for links, which still
 * use a dotted outline in Firefox by default.
 */

globalStyle(`:-moz-focusring`, {
  outline: "auto",
});

globalStyle(`table`, {
  borderCollapse: "collapse",
});

globalStyle(
  `h1,
   h2,
   h3,
   h4,
   h5,
   h6`,
  {
    fontSize: "inherit",
    fontWeight: "inherit",
  }
);

/** Reset links to optimize for opt-in styling instead of opt-out. */

globalStyle(`a`, {
  color: "inherit",
  textDecoration: "inherit",
});

/**
 * Reset form element properties that are easy to forget to style explicitly so
 * you don't inadvertently introduce styles that deviate from your design
 * system. These styles supplement a partial reset that is already applied by
 * normalize.css.
 */

globalStyle(
  `button,
   input,
   optgroup,
   select,
   textarea`,
  {
    padding: 0,
    lineHeight: "inherit",
    color: "inherit",
  }
);

/**
 * Use the configured 'mono' font family for elements that are expected to be
 * rendered with a monospace font, falling back to the system monospace stack if
 * there is no configured 'mono' font family.
 */

globalStyle(
  `pre,
   code,
   kbd,
   samp`,
  {
    fontFamily: tokens.font.code,
  }
);

/**
 * 1. Make replaced elements `display: block` by default as that's the behavior you
 *    want almost all of the time. Inspired by CSS Remedy, with `svg` added as well.
 *
 *    https://github.com/mozdevs/cssremedy/issues/14
 * 2. Add `vertical-align: middle` to align replaced elements more sensibly by
 *    default when overriding `display` by adding a utility like `inline`.
 *
 *    This can trigger a poorly considered linting error in some tools but is
 *    included by design.
 *
 *    https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210
 */

globalStyle(
  `img,
   svg,
   video,
   canvas,
   audio,
   iframe,
   embed,
   object`,
  {
    display: "block" /* 1 */,
    verticalAlign: "middle" /* 2 */,
  }
);

/**
 * Constrain images and videos to the parent width and preserve their intrinsic
 * aspect ratio.
 *
 * https://github.com/mozdevs/cssremedy/issues/14
 */

globalStyle(
  `img,
   video`,
  {
    maxWidth: "100%",
    height: "auto",
  }
);

/** Ensure the default browser behavior of the `hidden` attribute. */

globalStyle(`[hidden]`, {
  display: "none",
});
