var pex = require('../../build/pex.js');

pex.sys.IO.loadTextFile("readme.txt", function(str) {
  pex.utils.Log.message(str);
});
