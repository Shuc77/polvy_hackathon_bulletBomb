const path = require('path');

const nodeModulesPath = path.resolve(__dirname, '../node_modules');

exports.coreJsImports = ['weak-map'].map(item => {
  return path.join(nodeModulesPath, `core-js/es/${item}`);
});
