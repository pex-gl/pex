var pex = pex || require('../../build/pex');

var fx = pex.fx;

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
    var gl = pex.gl.Context.currentContext.gl;
    this.camera = new pex.scene.Camera(60, this.width/this.height);
    this.arcball = new pex.scene.Arcball(this, this.camera, 2);
    this.mesh = new pex.gl.Mesh(new pex.geom.gen.Cube(), new pex.materials.ShowNormals());
    this.framerate(60);
  },
  drawScene: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.mesh.draw(this.camera);
  },
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    //fx().render({width:this.width, height:this.height, drawFunc: this.drawScene.bind(this)}).blit();
    fx().render({ drawFunc: this.drawScene.bind(this), depth:true}).blit();
  }
});

