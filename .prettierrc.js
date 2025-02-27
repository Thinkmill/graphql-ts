module.exports =
  // inline snapshots don't play well with the plugin for some reason
  process.env.NODE_ENV !== "test"
    ? {
        plugins: [require.resolve("prettier-plugin-jsdoc")],
        trailingComma: "es5",
      }
    : { trailingComma: "es5" };
