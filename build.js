//http://blog.tojicode.com/2012/04/webgl-texture-utils-and-building.html
//http://requirejs.org/docs/node.html#nodeModules
//https://github.com/jrburke/amdefine

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
    { name:"fs", location:"../src/pex/node", main:"fs" },
    { name:"path", location:"../src/pex/node", main:"path" },
    { name:"sys", location: "../src/pex/node", main: "sys" },
    { name:"events", location: "../src/pex/node", main: "events" }
  ],
  optimize : "none"
};

var configPlask = {
  baseUrl : "src",
  name : "pex/Pex",
  out : "build/plask/pex-core.js",
  exclude:[ "plask", "fs", "path", "sys", "events" ],
  packages:[
    { name:"plask",location:"../src/pex/node", main:"plask" },
    { name:"fs", location:"../src/pex/node", main:"fs" },
    { name:"path", location:"../src/pex/node", main:"path" },
    { name:"sys", location: "../src/pex/node", main: "sys" },
    { name:"events", location: "../src/pex/node", main: "events" }
  ],
  optimize : "none"
};

var configNode = {
  baseUrl : "src",
  name : "pex/Pex",
  out : "build/plask/pex-core.js",
  exclude:[ "plask", "fs", "path", "sys", "events" ],
  packages:[
    { name:"plask",location:"../src/pex/node", main:"plask" },
    { name:"fs", location:"../src/pex/node", main:"fs" },
    { name:"path", location:"../src/pex/node", main:"path" },
    { name:"sys", location: "../src/pex/node", main: "sys" },
    { name:"events", location: "../src/pex/node", main: "events" }
  ],
  optimize : "none"
};

var configAlmond = {
  baseUrl : "src",
  name : "../tools/almond",
  out : "build/almond/pex-core.js",
  include : "pex/Pex",
  packages:[
    { name:"plask",location:"../src/pex/node", main:"plask" },
    { name:"fs", location:"../src/pex/node", main:"fs" },
    { name:"path", location:"../src/pex/node", main:"path" },
    { name:"sys", location: "../src/pex/node", main: "sys" },
    { name:"events", location: "../src/pex/node", main: "events" }
  ],
  optimize : "none"
};

var filesToCopy = 0;

function copyFile(src, target, msg, prependText) {
  var is = fs.createReadStream(src)
  var os = fs.createWriteStream(target);

  filesToCopy++;

  if (prependText) {
    os.write(prependText)
  }

  util.pump(is, os, function() {
    console.log(msg);
    if (--filesToCopy == 0) {
      console.log("Done");
      process.exit(0);
    }
  });
}


requirejs.optimize(configWebGL, function (buildResponse) {
  copyFile("src/pex/pex-webgl.js", "build/webgl/pex-webgl.js", "WebGL core done", buildInjection);
  copyFile("src/pex/lib/require.js", "build/webgl/require.js", "WebGL requirejs done");
});

requirejs.optimize(configPlask, function (buildResponse) {
  copyFile("src/pex/pex-plask.js", "build/plask/pex-plask.js", "Plask core done", buildInjection);
});

requirejs.optimize(configNode, function (buildResponse) {
  copyFile("src/pex/pex-node.js", "build/node/pex-node.js", "Node core done", buildInjection);
});

requirejs.optimize(configAlmond, function (buildResponse) {
  copyFile("src/pex/pex-webgl.js", "build/almond/pex-node.js", "Almond core done", buildInjection);
});


//requirejs.optimize(configAlmond, function (buildResponse) {
//  console.log("Almond done");
//});
