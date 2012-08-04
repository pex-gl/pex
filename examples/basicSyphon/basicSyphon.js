var Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/cameras/PerspectiveCamera",
  "pex/cameras/Arcball",
  "pex/geom/Geom",
  "pex/materials/Materials",
  "ScreenImage",
  "SyphonClientProxy",
  "ProcessWatchdog"
  ],
  function(Core, Window, PerspectiveCamera, Arcball, Geom, Materials, ScreenImage, SyphonClientProxy, ProcessWatchdog) {
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
        var gl = Core.Context.currentContext.gl;
        var self = this;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.arcball = new Arcball(this, this.camera);
        this.mesh = new Core.Mesh(new Geom.Cube(), new Materials.TestMaterial());
        this.mesh.material.uniforms.color = new Core.Vec4(1.0, 0.0, 0.0, 1.0);

        this.syphonServerWatchog = new ProcessWatchdog();
        this.syphonServerWatchog.watch("Simple Server", "/Applications/Simple Server.app/Contents/MacOS/Simple Server", function() {
          console.log("DONE!");
          //self.syphonClientProxy = new SyphonClientProxy(self, "");
        })
        //setTimeout(function() {
        //
        //}, 1000)

        self.syphonClientProxy = new SyphonClientProxy(self, "");

        this.framerate(30);
      },
      draw: function() {
        var gl = Core.Context.currentContext.gl;
    		gl.clearColor(1, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.syphonClientProxy) {
          this.syphonClientProxy.update();
          this.syphonClientProxy.draw();
        }
        this.mesh.draw(this.camera);
      }
    });
  }
);

