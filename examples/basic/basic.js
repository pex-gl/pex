var Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/cameras/PerspectiveCamera",
  "pex/geom/Geom",
  "pex/materials/Materials"
  ],
  function(Core, Window, PerspectiveCamera, Geom, Materials) {
    Window.create({
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
        var gl = Core.Context.currentContext;
        gl.clearColor(0, 0, 0, 1);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.mesh = new Core.Mesh(new Geom.Cube(), new Materials.SolidColorMaterial(this.gl));
        this.mesh.material.uniforms.color = new Core.Vec4(1.0, 0.0, 0.0, 1.0);

        this.framerate(30);
      },
      draw: function() {
        var gl = Core.Context.currentContext;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.mesh.draw(this.camera);
      }
    });
  }
);

