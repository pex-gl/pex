if (typeof requirejs === 'undefined') requirejs = require('requirejs');

requirejs.config({
  paths : {
    'pex' : '../../src/pex/'
  },
  map : {
    '*' : {
      'text' : '../../tools/lib/text.js'
    }
  }
});

requirejs(['pex', 'pex/sys/IO', 'pex/utils/Log', 'text!readme.txt'], function(Pex, IO, Log, ReadmeTXT) {
  Log.message('Imported ' + ReadmeTXT);
  IO.loadTextFile('readme.txt', function(str) {
    Log.message('Loaded ' + str);
  });
});
