var Pex;

if (!Pex) Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/cameras/PerspectiveCamera",
  "pex/cameras/Arcball",
  "pex/geom/Geom",
  "pex/materials/Materials",
  "pex/util/Time",
  "pex/gui/GUI"
  ],
  function(Core, Window, PerspectiveCamera, Arcball, Geom, Materials, Time, GUI) {
    Window.create({
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
        var gl = Core.Context.currentContext.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.camera = new PerspectiveCamera(60, this.width/this.height);

        this.materials.push(new Materials.SolidColorMaterial());
        this.materials.push(new Materials.TestMaterial());
        this.materials.push(new Materials.ShowTexCoordsMaterial());
        this.materials.push(new Materials.ShowNormalMaterial());
        this.materials.push(new Materials.DiffuseMaterial());
        this.mesh = new Core.Mesh(new Geom.Cube(), this.materials[this.materialIndex]);

        this.framerate(30);
        this.speed = 1;
        this.rotate = true;
        this.distance = 1;

        this.gui = new GUI(this);
        this.gui.addLabel("GUI Test");
        this.gui.addLabel("'S' - save settings");
        this.gui.addLabel("'L' - load settings");
        this.gui.addLabel("");
        this.gui.addLabel("CUBE");
        //this.gui.addParam("Color", this, "color");
        this.gui.addParam("Rotate", this, "rotate");
        this.gui.addParam("Rotate speed", this, "speed", {min:0, max:5});
        this.gui.addLabel("CAMERA");
        this.gui.addParam("Distance", this, "distance", {min:0.5, max:5});
        var radioList = this.gui.addRadioList("MATERIAL", this, "materialIndex", [
          { name:"None", value:0 },
          { name:"Test", value:1 },
          { name:"Texture", value:2 },
          { name:"Normal", value:3 },
          { name:"Diffuse", value:4 }
        ], function(idx) { console.log("Material changed", idx); }).setPosition(200, 90);

        this.gui.load("client.gui.settings.txt");

        var self = this;
        this.on('keyDown', function(e) {
          switch(e.str) {
            case 'S': self.gui.save("client.gui.settings.txt"); break;
            case 'L': self.gui.load("client.gui.settings.txt"); break;
          }
        })
      },
      draw: function() {
        var gl = Core.Context.currentContext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.camera.setPosition(new Core.Vec3(0, this.distance * 1, this.distance * 2));

        if (this.rotate) {
          this.mesh.rotation.w += Time.delta * this.speed;
        }
        this.mesh.setMaterial(this.materials[this.materialIndex]);
        this.mesh.draw(this.camera);

        this.gui.draw();
      }
    });
  }
);

