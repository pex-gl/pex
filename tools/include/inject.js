//r.js does it for us but almond not
require.nodeRequire = pexNodeRequire;

PexGlobalConfig = {
  nodeRequire : pexNodeRequire,
  originalRequire : pexAsyncRequire,
  originalDefine : pexAsyncDefine,
  definedModules : [],
  libPathsMap : { text : '../tools/lib/text' }
};

//intercept almond define to capture list of defined modules
(function() {
  var almondDefine = define;
  define = function(name, deps, callback) {
    almondDefine(name, deps, callback);
    var module = require(name);
    PexGlobalConfig.definedModules.push({ name: name, module: module });
  };
  define.amd = almondDefine.amd;
})();
