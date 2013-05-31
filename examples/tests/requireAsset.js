var pex = pex || require('../../build/pex.js');

pex.require(['lib/text!readme.txt'], function(readmeTxt) {
  console.log(readmeTxt);
});