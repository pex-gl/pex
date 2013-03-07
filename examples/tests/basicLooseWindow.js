if (typeof requirejs === 'undefined') requirejs = require('requirejs');

requirejs.config({
  paths : {
    'pex' : '../../src/pex/'
  },
  map : {
    '*' : {
      'pex' : '../../src/pex',
      'text' : '../../tools/lib/text.js'
    }
  }
});

requirejs(['pex', 'pex/sys/IO', 'pex/utils/Log', 'text!readme.txt'], function(pex, IO, Log, ReadmeTXT) {
  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      vsync: true,
      multisample: true,
      fullscreen: false,
      center: true
    },
    init: function() {
    },
    draw: function() {
      var gl = this.gl;
      gl.clearColor(1, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  })
});
