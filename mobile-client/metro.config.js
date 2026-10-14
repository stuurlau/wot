const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

// @wot/types ships TypeScript source whose relative imports use NodeNext
// `.js` specifiers (required by the API's `tsc`). Metro does not perform
// TypeScript's `.js` → `.ts` extension substitution, so rewrite those
// specifiers to the real `.ts` file when bundling from that package.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith(".") &&
    moduleName.endsWith(".js") &&
    context.originModulePath.includes(`${path.sep}shared${path.sep}types${path.sep}`)
  ) {
    const tsModuleName = `${moduleName.slice(0, -3)}.ts`;
    const candidate = path.resolve(path.dirname(context.originModulePath), tsModuleName);
    if (fs.existsSync(candidate)) {
      return context.resolveRequest(context, tsModuleName, platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
