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
  },
  window: function(obj) {
    //we overwrite obj's init function to capture GL context before init() gets executed
    obj.__init = obj.init;
    obj.init = function() {
      var gl = this.gl;
      requirejs(["pex/core/Context"], function(Context) {
        Context.currentContext = gl;
        if (obj.__init) {
          obj.__init();
        }
      });
    }

    plask.simpleWindow(obj);
  }
};


