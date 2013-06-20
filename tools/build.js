var requirejs = require('requirejs');

var config = {
  baseUrl : '../src',
  name : '../tools/lib/almond',
  include : ['../tools/include/inject.js', 'pex', '../tools/include/export'],
  out : '../build/pex.js',
  insertRequire: ['pex'],
  optimize : 'none',
  wrap: {
    startFile: '../tools/include/wrapBegin.js',
    endFile: '../tools/include/wrapEnd.js'
  }
};

requirejs.optimize(config, function (buildResponse) {
  console.log(buildResponse);
  console.log('Done almond.');
});
