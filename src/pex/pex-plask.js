var preloadCore;
var path = require('path');
var requirejs = require('requirejs');
var workingDirectory = path.dirname(module.parent.filename);
var path = __filename.replace("pex-plask.js", "");
var plask = require('plask');
var context = requirejs

requirejs.config({
  baseUrl: workingDirectory,
  priority : preloadCore ? [ path + "pex-core.js" ] : null,
  paths: { "pex": path },
  nodeRequire: require
});

module.exports = {
  require : requirejs,
  run : requirejs,
};


