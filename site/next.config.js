const withVanillaExtract = require("vanilla-extract-plugin-nextjs");

module.exports = withVanillaExtract({
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/npm/:pkg((?!@?[^@]+@\\d+\\.\\d\\.\\d[a-zA-Z0-9-]*).*)",
          destination: "/api/version-redirect",
        },
      ],
    };
  },
});
