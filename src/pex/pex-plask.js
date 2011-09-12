var requirejs = require('requirejs');

var path = __filename.replace("pex-plask.js", "");

requirejs.config({
    baseUrl: '.',
    paths: { "pex": path },
    nodeRequire: require
});

module.exports = {
  require : requirejs,
  run: function(module) {
    requirejs([module], function() {
    });
  },
  ready: function(handler) {
    handler(); //execute immediately
  }
};