var requirejs = require('requirejs');

var path = __filename.replace("pex-plask.js", "");

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
      baseUrl: this.require.baseUrl || ".",
      paths: { "pex": path },
      nodeRequire: require
    });
  },
  run: function(module) {
    this.config();
    requirejs([module], function() {
    });
  },
  ready: function(handler) {
    this.config();
    handler(); //execute immediately
  }
};