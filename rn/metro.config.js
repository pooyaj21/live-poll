const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Let Metro see the Convex backend so we can import its generated `api`.
config.watchFolders = [path.resolve(__dirname, "../backend")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
