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
    this.camera = new pex.scene.Camera(60, this.width/this.height, 0.1, 3);
    this.arcball = new pex.scene.Arcball(this, this.camera, 2);

    this.showNormals = new pex.materials.ShowNormals();
    this.packDepth = new pex.materials.PackDepth();
    this.mesh = new pex.gl.Mesh(new pex.geom.gen.Sphere(0.3), this.showNormals);

    this.instances = [];
    for(var i=0; i<10; i++) {
      this.instances.push(pex.utils.MathUtils.randomVec3(0.35));
    }

    this.imgRt = new pex.gl.ScreenImage(this.img);
  },
  drawColor: function() {
    this.mesh.setMaterial(this.showNormals);
    this.drawScene();
  },
  drawDepth: function() {
    this.mesh.setMaterial(this.packDepth);
    this.drawScene();
  },
  drawScene: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    this.instances.forEach(function(pos) {
      this.mesh.position = pos;
      this.mesh.draw(this.camera);
    }.bind(this));
  },
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);

    var color = fx().render({ drawFunc: this.drawColor.bind(this), depth:true });
    var depth = color.render({ drawFunc: this.drawDepth.bind(this), depth:true, near:0.1, far:3});
    var small = color.downsample4().downsample4();
    var blurred = small.threshold().blur7().blur7();
    var glowing = color.mult(blurred);
    var ssao = depth.ssao({near:0.1, far:30});
    var fin = color.mult(ssao).mult(ssao).mult(ssao);

    color.blit({x:0, y:0, width:this.width/2, height: this.height/2});
    small.blit({x:this.width/2, y:0, width:this.width/2, height: this.height/2});
    blurred.blit({x:0, y:this.height/2, width:this.width/2, height: this.height/2});
    ssao.blit({x:this.width/2, y:this.height/2, width:this.width/2, height: this.height/2});
    fin.blit({x : this.width*0.35, y:this.height/4, width:this.width*0.35,height:this.width*0.35*this.height/this.width});
  }
});

