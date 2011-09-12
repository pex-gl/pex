define([
  "plask",
  "pex/core/Core",
  "pex/cameras/PerspectiveCamera",
  "pex/geom/Geom",
  "pex/materials/Materials"
  ],
  function(plask, Core, PerspectiveCamera, Geom, Materials) {
    plask.simpleWindow({
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
        var gl = this.gl;
        gl.clearColor(0, 0, 0, 1);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.mesh = new Core.Mesh(this.gl, new Geom.Cube(), new Materials.SolidColorMaterial(this.gl));
        this.mesh.material.uniforms.color = new Core.Vec4(1.0, 0.0, 0.0, 1.0);

        this.framerate(30);
      },
      draw: function() {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.mesh.draw(this.camera);
      }
    });
  }
);