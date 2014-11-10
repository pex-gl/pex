var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var mat = require('pex-materials');
var color = require('pex-color');
var rnd = require('pex-random');

var HexSphere = gen.HexSphere;
var Mesh = glu.Mesh;
var Diffuse = mat.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Time = sys.Time;
var Platform = sys.Platform;

sys.Window.create({
  settings: {
    width: 140,
    height: 140,
    type: '3d',
    canvas: Platform.isBrowser ? document.getElementById("headerCanvas") : null
  },
  init: function() {
    var sphere = new HexSphere(1, 3);
    sphere = sphere.triangulate();
    sphere.computeNormals();
    this.origSphere = sphere.clone();
    this.mesh = new Mesh(sphere, new Diffuse({ wrap: 1, diffuseColor: new Color(26/255, 188/255, 156/255, 1.0) }));

    this.camera = new PerspectiveCamera(30, this.width / this.height);
    //this.arcball = new Arcball(this, this.camera);

    this.bgColor = new Color(26/255, 188/255, 156/255, 1.0);
    //this.bgColor = Color.White;
  },
  draw: function() {
    glu.clearColorAndDepth(this.bgColor);
    glu.enableDepthReadAndWrite(true);

    var origSphere = this.origSphere;

    this.mesh.geometry.vertices.forEach(function(v, vi) {
      var n = origSphere.vertices[vi].dup().normalize()
      var f = 0.2 * rnd.noise3(n.x + Time.seconds, n.y, n.z);
      v.setVec3(origSphere.vertices[vi]);
      v.add(n.scale(f));
    });
    this.mesh.geometry.vertices.dirty = true;
    this.mesh.geometry.computeNormals();

    this.mesh.draw(this.camera);
  }
});
