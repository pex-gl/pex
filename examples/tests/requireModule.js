var pex = pex || require('../../build/pex.js');

pex.require(['Test', 'submodule/Submodule'], function(Test, Submodule) {
  console.log(Test.msg, Submodule.hello);
});