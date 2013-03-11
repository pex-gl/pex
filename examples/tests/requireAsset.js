var pex = pex || require('../../build/pex.js');

pex.require(['text!readme.txt'], function(readmeTxt) {
  console.log(readmeTxt);
});