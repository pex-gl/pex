//Initialization code of Pex when running using Plask.

var preloadCore;
var path = require('path');
var requirejs = require('requirejs');
var workingDirectory = path.dirname(module.parent.filename);
var pexPath = __filename.replace("pex-node.js", "");

requirejs.config({
  baseUrl: workingDirectory,
  priority : preloadCore ? [ pexPath + "pex-core.js" ] : null,
  paths: {
    "pex": pexPath,
    "text" : pexPath + "lib/text"
  },
  packages : [
    { name: "plask", location: pexPath + "node", main: "plask-node" }
  ],  
  nodeRequire: require,
  ready: function() {
    console.log("READY!");
  }
});

requirejs.pexWorkingDirectory = workingDirectory;


// requirejs(['pex/Core'], function   (foo,   bar) {
//     //foo and bar are loaded according to requirejs
//     //config, but if not found, then node's require
//     //is used to load the module.
// 
//     //Now export a value visible to Node.
//     module.exports = function () {};
// });

module.exports = {
  require : requirejs,
  run : requirejs,
};
