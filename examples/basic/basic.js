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
    this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
    this.arcball = new pex.scene.Arcball(this, this.camera, 2);
    this.mesh = new pex.gl.Mesh(new pex.geom.gen.Cube(), new pex.materials.ShowNormals());
    this.mesh.rotation = new pex.geom.Quat().setAxisAngle(new pex.geom.Vec3(1, 0, 0), 45);
    this.framerate(60);
  },
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.mesh.draw(this.camera);
  }
});

