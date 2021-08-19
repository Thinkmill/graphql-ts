import { createTheme, globalStyle, style } from "@vanilla-extract/css";

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
  color: {
    white: "#ffffff",
    black: "#000000",

    gray50: "#f8f9fa",
    gray100: "#f1f3f5",
    gray200: "#e9ecef",
    gray300: "#dee2e6",
    gray400: "#ced4da",
    gray500: "#adb5bd",
    gray600: "#868e96",
    gray700: "#495057",
    gray800: "#343a40",
    gray900: "#212529",

    red50: "#fff5f5",
    red100: "#ffe3e3",
    red200: "#ffc9c9",
    red300: "#ffa8a8",
    red400: "#ff8787",
    red500: "#ff6b6b",
    red600: "#fa5252",
    red700: "#f03e3e",
    red800: "#e03131",
    red900: "#c92a2a",

    pink50: "#fff0f6",
    pink100: "#ffdeeb",
    pink200: "#fcc2d7",
    pink300: "#faa2c1",
    pink400: "#f783ac",
    pink500: "#f06595",
    pink600: "#e64980",
    pink700: "#d6336c",
    pink800: "#c2255c",
    pink900: "#a61e4d",

    grape50: "#f8f0fc",
    grape100: "#f3d9fa",
    grape200: "#eebefa",
    grape300: "#e599f7",
    grape400: "#da77f2",
    grape500: "#cc5de8",
    grape600: "#be4bdb",
    grape700: "#ae3ec9",
    grape800: "#9c36b5",
    grape900: "#862e9c",

    violet50: "#f3f0ff",
    violet100: "#e5dbff",
    violet200: "#d0bfff",
    violet300: "#b197fc",
    violet400: "#9775fa",
    violet500: "#845ef7",
    violet600: "#7950f2",
    violet700: "#7048e8",
    violet800: "#6741d9",
    violet900: "#5f3dc4",

    indigo50: "#edf2ff",
    indigo100: "#dbe4ff",
    indigo200: "#bac8ff",
    indigo300: "#91a7ff",
    indigo400: "#748ffc",
    indigo500: "#5c7cfa",
    indigo600: "#4c6ef5",
    indigo700: "#4263eb",
    indigo800: "#3b5bdb",
    indigo900: "#364fc7",

    blue50: "#e7f5ff",
    blue100: "#d0ebff",
    blue200: "#a5d8ff",
    blue300: "#74c0fc",
    blue400: "#4dabf7",
    blue500: "#339af0",
    blue600: "#228be6",
    blue700: "#1c7ed6",
    blue800: "#1971c2",
    blue900: "#1864ab",

    cyan50: "#e3fafc",
    cyan100: "#c5f6fa",
    cyan200: "#99e9f2",
    cyan300: "#66d9e8",
    cyan400: "#3bc9db",
    cyan500: "#22b8cf",
    cyan600: "#15aabf",
    cyan700: "#1098ad",
    cyan800: "#0c8599",
    cyan900: "#0b7285",

    teal50: "#e6fcf5",
    teal100: "#c3fae8",
    teal200: "#96f2d7",
    teal300: "#63e6be",
    teal400: "#38d9a9",
    teal500: "#20c997",
    teal600: "#12b886",
    teal700: "#0ca678",
    teal800: "#099268",
    teal900: "#087f5b",

    green50: "#ebfbee",
    green100: "#d3f9d8",
    green200: "#b2f2bb",
    green300: "#8ce99a",
    green400: "#69db7c",
    green500: "#51cf66",
    green600: "#40c057",
    green700: "#37b24d",
    green800: "#2f9e44",
    green900: "#2b8a3e",

    lime50: "#f4fce3",
    lime100: "#e9fac8",
    lime200: "#d8f5a2",
    lime300: "#c0eb75",
    lime400: "#a9e34b",
    lime500: "#94d82d",
    lime600: "#82c91e",
    lime700: "#74b816",
    lime800: "#66a80f",
    lime900: "#5c940d",

    yellow50: "#fff9db",
    yellow100: "#fff3bf",
    yellow200: "#ffec99",
    yellow300: "#ffe066",
    yellow400: "#ffd43b",
    yellow500: "#fcc419",
    yellow600: "#fab005",
    yellow700: "#f59f00",
    yellow800: "#f08c00",
    yellow900: "#e67700",

    orange50: "#fff4e6",
    orange100: "#ffe8cc",
    orange200: "#ffd8a8",
    orange300: "#ffc078",
    orange400: "#ffa94d",
    orange500: "#ff922b",
    orange600: "#fd7e14",
    orange700: "#f76707",
    orange800: "#e8590c",
    orange900: "#d9480f",
  },
});

/** Our codeFont stack as a style for easy use */

export const codeFont = style({
  fontFamily: tokens.font.code,
  fontVariantLigatures: "none",
});

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
    listStyle: "none",
    margin: 0,
    padding: 0,
  }
);

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
