var pex = pex || require('../../build/pex');

var materials = pex.materials;
var Time = pex.utils.Time;

pex.sys.Window.create({
  settings: {
    width: 1024,
    height: 720,
    type: '3d',
    vsync: true,
    multisample: true,
    fullscreen: false,
    center: true
  },
  color: [255, 0, 128],
  materials: [],
  materialIndex: 1,
  init: function() {
    var gl = pex.gl.Context.currentContext.gl;

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);

    this.texture = pex.gl.Texture2D.load('opengl.png');

    this.materials.push(new materials.SolidColor());
    this.materials.push(new materials.Test());
    this.materials.push(new materials.ShowTexCoords());
    this.materials.push(new materials.ShowNormals());
    this.materials.push(new materials.Diffuse());
    this.materials.push(new materials.Textured({texture:this.texture}));
    this.materials.push(new materials.Textured({texture:this.texture}));
    this.mesh = new pex.gl.Mesh(new pex.geom.gen.Cube(), this.materials[this.materialIndex]);
    this.mesh.rotationAxis = pex.geom.Vec3.create(0, 1, 0);
    this.mesh.rotationAngle = 0;

    this.framerate(30);
    this.speed = 1;
    this.rotate = true;
    this.distance = 1;

    this.gui = new pex.gui.GUI(this);
    this.gui.addLabel('GUI Test');
    this.gui.addLabel('S - save settings');
    this.gui.addLabel('L - load settings');
    this.gui.addLabel('');
    this.gui.addLabel('CUBE');
    this.gui.addParam('Scale', this.mesh, 'scale', {min:0, max:1});
    this.gui.addParam('Color', this, 'color', {min:0, max:255});
    this.gui.addParam('Rotate', this, 'rotate');
    this.gui.addParam('Rotate speed', this, 'speed', {min:0, max:5});
    this.gui.addLabel('CAMERA');
    this.gui.addParam('Distance', this, 'distance', {min:0.5, max:5});
    this.gui.addTexture2D('Texture', this.texture);
    var radioList = this.gui.addRadioList('MATERIAL', this, 'materialIndex', [
      { name:'None', value:0 },
      { name:'Test', value:1 },
      { name:'TexCoords', value:2 },
      { name:'Normal', value:3 },
      { name:'Diffuse', value:4 },
      { name:'Textured', value:5 },
      { name:'Textured with Alpha', value:6 }
    ], function(idx) { console.log('Material changed', idx); }).setPosition(180, 10);

    this.gui.load('client.gui.settings.txt');

    var self = this;
    this.on('keyDown', function(e) {
      switch(e.str) {
        case 'S': self.gui.save('client.gui.settings.txt'); break;
        case 'L': self.gui.load('client.gui.settings.txt'); break;
      }
    });
  },
  draw: function() {
    var gl = pex.gl.Context.currentContext.gl;
    gl.clearColor(this.color[0] / 255, this.color[1] / 255, this.color[2] / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.setPosition(new pex.geom.Vec3.create(0, this.distance * 1, this.distance * 2));

    if (this.rotate) {
      this.mesh.rotationAngle += Time.delta * this.speed * 5;
      this.mesh.rotation.setAxisAngle(this.mesh.rotationAxis, this.mesh.rotationAngle);
    }

    this.mesh.setMaterial(this.materials[this.materialIndex]);

    if (this.materialIndex == 6) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
    }
    else {
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
    }

    this.mesh.draw(this.camera);

    this.gui.draw();
  }
});

