const { getDefaultConfig } = require("expo/metro-config");
const { withDebugMenu } = require("@pj21/debug-menu/metro");

const config = getDefaultConfig(__dirname);

// Swaps the debug menu for its noop entry in production bundles.
module.exports = withDebugMenu(config, {
  enabled: process.env.NODE_ENV !== "production",
});
