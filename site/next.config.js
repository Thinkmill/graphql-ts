const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");

const withVanillaExtract = createVanillaExtractPlugin();

const withBundleAnalyzer =
  ({ enabled = true } = {}) =>
  (nextConfig = {}) => {
    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        if (enabled) {
          const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              reportFilename: options.isServer
                ? "../analyze/server.html"
                : "./analyze/client.html",
              generateStatsFile: true,
              statsFilename: options.isServer
                ? "../analyze/server-stats.json"
                : "./analyze/client-stats.json",
            })
          );
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }
        return config;
      },
    });
  };

module.exports = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(
  withVanillaExtract({
    async rewrites() {
      return {
        beforeFiles: [
          {
            source: "/npm/:pkg((?!@?[^@]+@\\d+\\.\\d+\\.\\d+[a-zA-Z0-9-]*).*)",
            destination: "/api/version-redirect",
          },
        ],
      };
    },
  })
);
