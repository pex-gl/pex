var Pex;
if (!Pex) {
  Pex = require("../../src/pex/pex-plask");
}

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/util/Util",
  "pex/cameras/PerspectiveCamera",
  "pex/geom/Geom",
  "pex/materials/Materials"
  ],
  function(Core, Window, Util, PerspectiveCamera, Geom, Materials) {
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
        var gl = Core.Core.Context.currentContext.gl;

        gl.clearColor(0, 0, 0, 0);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.camera.setPosition(new Core.Vec4(3, 3, 3));
        this.mesh = new Core.Mesh(new Geom.Cube(), new Materials.SolidColorMaterial());
        this.mesh.material.uniforms.color = new Core.Vec4(1.0, 0.0, 0.0, 0.25);

        this.framerate(30);
      },
      draw: function() {
        var gl = Core.Core.Context.currentContext.gl;

        Util.Time.update();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this.camera.setAspectRatio((this.width/3) / this.height);

        gl.viewport(0, 0, this.width/3, this.height);
        gl.blendFunc(gl.ONE, gl.ONE);
        this.drawScene();

        //additive blending
        gl.viewport(this.width/3, 0, this.width/3, this.height);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        this.drawScene();

        //alpha blending
        gl.viewport(2*this.width/3, 0, this.width/3, this.height);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //possibly better solution
        //gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
        //gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
        this.drawScene();

        this.mesh.rotation = new Core.Vec4(0, 1, 0, Util.Time.seconds);
      },
      drawScene: function() {
        this.mesh.position = new Core.Vec3(-0.4, 0, 0);
        this.mesh.material.uniforms.color = new Core.Vec4(1.0, 0.0, 0.0, 0.25);
        this.mesh.draw(this.camera);

        this.mesh.position = new Core.Vec3(0, 0.4, 0);
        this.mesh.material.uniforms.color = new Core.Vec4(0.0, 1.0, 0.0, 0.25);
        this.mesh.draw(this.camera);

        this.mesh.position = new Core.Vec3(0.4, -0.1, 0);
        this.mesh.material.uniforms.color = new Core.Vec4(0.0, 0.0, 1.0, 0.25);
        this.mesh.draw(this.camera);
      }
    });
  }
);