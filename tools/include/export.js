require(['pex'], function(pex) {
  if (typeof(exports) !== 'undefined') {
    for(var moduleName in pex) {
      exports[moduleName] = pex[moduleName];
    }
  }
  if (typeof(window) !== 'undefined') window['pex'] = pex;
}, 'export', true);
