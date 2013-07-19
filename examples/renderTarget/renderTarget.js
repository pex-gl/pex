var pex = pex || require('../../build/pex');

pex.sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    vsync: true,
    multisample: true,
    fullscreen: false,
    center: true,
    canvas : pex.sys.Platform.isBrowser ? document.getElementById('canvas') : null
  },
  init: function() {
    this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
    this.rtCamera = new pex.scene.PerspectiveCamera(60, 1);
    this.arcball = new pex.scene.Arcball(this, this.camera, 2);

    this.rt = new pex.gl.RenderTarget(512, 512, { depth : true });
    this.renderedMesh = new pex.gl.Mesh(new pex.geom.gen.Cube(2), new pex.materials.ShowNormals());
    this.cubeMesh = new pex.gl.Mesh(new pex.geom.gen.Cube(), new pex.materials.Textured({ texture : this.rt.getColorAttachement(0)}));
  },
  draw: function() {
    var gl = this.gl;
    gl.enable(gl.DEPTH_TEST);

    this.rt.bind();
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.renderedMesh.rotation.setAxisAngle(this.camera.up, pex.utils.Time.seconds);
    gl.viewport(0, 0, this.rt.width, this.rt.height);
    this.renderedMesh.draw(this.rtCamera);
    this.rt.unbind();

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.cubeMesh.draw(this.camera);
  }
});
