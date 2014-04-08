var fs = require("fs");
var pex = require('../../build/pex');

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

    // function to load and eval drawing function from file
    var loadDrawFunc = function() {
      var fileContents = fs.readFileSync("./draw.js", { "encoding": "utf8" });
      var stringToEval = "this.drawFunc = function() {\n" + fileContents + "}";
      eval(stringToEval);

      console.log("new draw function:");
      console.log(this.drawFunc.toString());
      console.log("\n");
    };

    // load draw function on start
    loadDrawFunc.call(this);

    // watch file for changes and reload
    fs.watch("./draw.js", function() {
      loadDrawFunc.call(this);
    }.bind(this));
  },

  draw: function() {
    if (this.drawFunc) this.drawFunc.call(this);
  }
});

