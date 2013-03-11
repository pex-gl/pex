define(['pex/sys/Platform'], function(Platform) {
  var requireFunc;
  var defineFunc;

  function captureRequireJS() {
    var config = (typeof PexGlobalConfig === 'object') ? PexGlobalConfig : null;

    if (Platform.isPlask) {
      //we can't just use require by default as it might have been overwritten by almond in this context
      if (config && config.nodeRequire) {
        requireFunc = config.nodeRequire('requirejs');
      }
      else {
        requireFunc = require('requirejs');
      }
      defineFunc = requireFunc.define;
    }
    else if (config && config.originalRequire) {
      requireFunc = config.originalRequire;
      defineFunc = config.originalDefine;
    }
    else {
      requireFunc = require;
      defineFunc = define;
    }

    requireFunc.config({
      map : {
          '*' : config.libPathsMap
      }
    });

    config.definedModules.forEach(function(moduleEntry) {
      defineFunc(moduleEntry.name, [], function() { return moduleEntry.module });
    });
  }

  function Require(deps, callback) {
    if (!requireFunc && !defineFunc) {
      captureRequireJS();
    }

    requireFunc(deps, callback);
  }

  return Require;
});