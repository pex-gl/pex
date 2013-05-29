var pex = pex || require('../../build/pex.js');

pex.require(['Nothing', 'submodule/Submodule'], function(Nothing, Submodule) {
  console.log(Nothing.msg, Submodule.hello);
});