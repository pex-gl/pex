var Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/cameras/PerspectiveCamera",
  "pex/cameras/Arcball",
  "pex/geom/Geom",
  "pex/materials/Materials",
  "pex/util/Time",
  "pex/behaviors/Orbiter",
  "pex/gui/ScreenImage"
  ],
  function(Core, Window, PerspectiveCamera, Arcball, Geom, Materials, Time, Orbiter, ScreenImage) {
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

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.arcball = new Arcball(this, this.camera);
        this.mesh = new Core.Mesh(new Geom.Cube(0.2), new Materials.DiffuseMaterial());
        this.mesh.material.uniforms.diffuseColor = new Core.Vec4(1.0, 0.0, 0.0, 1.0);
        this.mesh.material.uniforms.ambientColor = new Core.Vec4(0.5, 0.0, 0.0, 1.0);

        var cube = new Geom.Cube(0.2);
        cube.computeEdges();
        this.orbitingMesh = new Core.Mesh(cube, new Materials.SolidColorMaterial(), { useEdges:true, primitiveType:gl.LINES });

        this.cubeCenter = new Core.Mesh(new Geom.Sphere(0.03), new Materials.SolidColorMaterial({color: new Core.Vec4(0,1,0,1)}));

        this.orbiter = new Orbiter(new Core.Vec3(0, 0, 0), 1, this.orbitingMesh, "position");

        var pointerTex = Core.Texture2D.load("pointer.png");
        this.pointer = new ScreenImage(this.width, this.height, this.width/2, this.height/2, 64, 64, pointerTex);

        this.framerate(30);
      },
      draw: function() {
        var gl = Core.Context.currentContext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.mesh.rotation.w = Time.seconds;
        this.mesh.draw(this.camera);

        this.orbiter.update(Time.delta);
        this.orbitingMesh.draw(this.camera);

        this.cubeCenter.position = this.orbitingMesh.position;
        this.cubeCenter.draw(this.camera);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        var pos = this.camera.getScreenPos(this.orbitingMesh.position, this.width, this.height);
        pos.x -= 64/2;
        pos.y -= 64/2;
        this.pointer.setPosition(pos);
        this.pointer.draw();
        gl.disable(gl.BLEND);
      }
    });
  }
);

