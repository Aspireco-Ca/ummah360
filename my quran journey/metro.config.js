const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.useWatchman = false;
config.resolver.nodeModulesPaths = [path.resolve(__dirname, '..', 'node_modules')];

module.exports = config;
