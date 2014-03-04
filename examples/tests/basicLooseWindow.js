if (typeof requirejs === 'undefined') requirejs = require('requirejs');

requirejs.config({
  baseUrl : __dirname,
  paths : {
    'pex' : __dirname + '/../../src/pex',
    'lib' : __dirname + '/../../src/lib',
  },
});

requirejs(['pex', 'pex/sys', 'pex/scene', 'pex/gl', 'pex/geom', 'pex/geom/gen', 'pex/materials', 'pex/utils', 'lib/text!readme.txt'],
  function(pex, sys, scene, gl, geom, gen, materials, utils, ReadmeTXT) {
  sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      vsync: true,
      multisample: true,
      fullscreen: false,
      center: true,
      canvas : sys.Platform.isBrowser ? document.getElementById('canvas') : null
    },
    init: function() {
      this.camera = new scene.Camera(60, this.width/this.height);
      this.arcball = new scene.Arcball(this, this.camera, 2);
      this.mesh = new gl.Mesh(new geom.gen.Cube(), new materials.ShowNormals());
      this.framerate(60);
      utils.Log.message(ReadmeTXT);
    },
    draw: function() {
      var gl = this.gl;
      gl.clearColor(1, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      this.mesh.draw(this.camera);
    }
  });
});
