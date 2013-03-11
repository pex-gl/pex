var pex = pex || require('../../build/pex');

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
    this.camera = new pex.scene.Camera(60, this.width/this.height);
    new pex.scene.Arcball(this, this.camera, 2);
    var cube = new pex.geom.gen.Cube();
    cube.rotation = pex.geom.Quat.create();
    var solidMaterial = new pex.materials.SolidColorMaterial();
    this.mesh = new pex.gl.Mesh(cube, solidMaterial);
  },
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.mesh.draw(this.camera);
  }
});

