var preloadCore;
var path = require('path');
var requirejs = require('requirejs');
var workingDirectory = path.dirname(module.parent.filename);
var path = __filename.replace("pex-plask.js", "");
var plask = require('plask');
var context = requirejs

module.exports = {
  require : requirejs,
  configDone: false,
  config: function() {
    if (!this.configDone) {
      this.configDone = true;
    }
    else {
      return;
    }
    requirejs.config({
      baseUrl: this.require.baseUrl || workingDirectory,
      priority : preloadCore ? [ path + "pex-core.js" ] : null,
      paths: { "pex": path },
      nodeRequire: require
    });
  },
  run: function(moduleName) {
    this.config();
    requirejs([moduleName], function() {
    });
  },
  ready: function(handler) {
    this.config();
    handler(); //execute immediately
  }
};


