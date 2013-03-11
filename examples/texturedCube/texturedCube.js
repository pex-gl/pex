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

    var texture = pex.gl.Texture2D.load('assets/plask.png', function(texture) {
      var material = new pex.materials.Textured({texture : texture});
      this.mesh = new pex.gl.Mesh(cube, material);
      this.mesh.scale[0] = 0.25;
      this.mesh.scale[1] = 0.25;
      this.mesh.scale[2] = 0.25;
    }.bind(this));

    this.framerate(60);

    for(var i=0; i<100; i++) {
      var rot = pex.geom.Quat.create();
      pex.geom.Quat.setAxisAngle(rot, pex.geom.Vec3.fromValues(0, 1, 0), Math.random() * Math.PI);
      this.instances.push({
        position: pex.geom.Vec3.fromValues(
          Math.random()*2 - 1,
          Math.random()*2 - 1,
          Math.random()*2 - 1
        ),
        rotation: rot
      });
    }
  },
  instances: [],
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //pex.geom.Quat.setAxisAngle(this.mesh.rotation, this.camera.up, pex.utils.Time.seconds);

    if (this.mesh) this.instances.forEach(function(instance) {
      this.mesh.position = instance.position;
      this.mesh.rotation = instance.rotation;
      this.mesh.draw(this.camera);
    }.bind(this));

    //var mem = process.memoryUsage();
    //console.log(Math.floor(mem.rss/10000)/100, Math.floor(mem.heapTotal/10000)/100, Math.floor(mem.heapUsed/10000)/100);
  }
});

