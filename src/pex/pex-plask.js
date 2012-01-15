//Initialization code of Pex when running using Plask.

var preloadCore;
var path = require('path');
var requirejs = require('requirejs');
var workingDirectory = path.dirname(module.parent.filename);
var pexPath = __filename.replace("pex-plask.js", "");
var plask = require('plask');

requirejs.config({
  baseUrl: workingDirectory,
  priority : preloadCore ? [ pexPath + "pex-core.js" ] : null,
  paths: {
    "pex": pexPath,
    "text" : pexPath + "lib/text"
  },
  nodeRequire: require
});

requirejs.pexWorkingDirectory = workingDirectory;

module.exports = {
  require : requirejs,
  run : requirejs,
};
