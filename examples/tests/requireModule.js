var pex = pex || require('../../build/pex.js');

pex.require(['Test'], function(Test) {
  console.log(Test.msg);
});