// Disable chunk splitting so everything reachable from main entry point ends up in a single main.js bundle,
// replicating ngx-build-plus's `--single-bundle` behavior. Polyfills and styles stay in their own bundles.
module.exports = {
  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
};
