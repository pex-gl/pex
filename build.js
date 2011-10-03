var requirejs = require('requirejs');
var fs = require('fs');
var util = require('util');

//var buildInjection = "var priority = [ 'pex-core.js']; \n";
var buildInjection = "var preloadCore = true; \n";

var configWebGL = {
  baseUrl : "src",
  name : "pex/Pex",
  out : "build/webgl/pex-core.js",
  packages:[
    { name:"plask",location:"../src/pex/node", main:"plask" },
    { name:"fs", location:"../src/pex/node", main:"fs" }
  ],
  optimize : "none"
};

var configPlask = {
  baseUrl : "src",
  name : "pex/Pex",
  out : "build/plask/pex-core.js",
  exclude:[ "plask", "fs" ],
  packages:[
    { name:"plask",location:"../src/pex/node", main:"plask" },
    { name:"fs", location:"../src/pex/node", main:"fs" }
  ],
  optimize : "none"
};

function copyFile(src, target, msg, prependText) {
  var is = fs.createReadStream(src)
  var os = fs.createWriteStream(target);

  if (prependText) {
    os.write(prependText)
  }

  util.pump(is, os, function() {
    console.log(msg);
  });
}


requirejs.optimize(configWebGL, function (buildResponse) {
  copyFile("src/pex/pex-webgl.js", "build/webgl/pex-webgl.js", "WebGL core done", buildInjection);
  copyFile("src/pex/lib/require.js", "build/webgl/require.js", "WebGL requirejs done");
});

requirejs.optimize(configPlask, function (buildResponse) {
  copyFile("src/pex/pex-plask.js", "build/plask/pex-plask.js", "Plask core done", buildInjection);
});