var Pex = require("../../src/pex/pex-plask");

Pex.run([
  "pex/core/Core",
  "pex/sys/Window",
  "pex/cameras/PerspectiveCamera",
  "pex/cameras/Arcball",
  "pex/geom/Geom",
  "pex/materials/Materials",
  "pex/util/RandUtils"
  ],
  function(Core, Window, PerspectiveCamera, Arcball, Geom, Materials, RandUtils) {
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
      meshes: [],
      mouseX: 0,
      mouseY: 0,
      init: function() {
        var gl = Core.Context.currentContext.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.camera = new PerspectiveCamera(60, this.width/this.height);
        this.arcball = new Arcball(this, this.camera);

        this.defaultMaterial = new Materials.ShowNormalMaterial();
        this.hitMaterial = new Materials.SolidColorMaterial({color: Core.Color.Red.toVec4()});

        for(var i=0; i<100; i++) {
          var cube = new Core.Mesh(new Geom.Cube(0.25), this.defaultMaterial);
          cube.position = RandUtils.randomVec3InSphere(2);
          cube.rotation = Core.Quat.fromRotationAxis(Math.random() * 60, 1, 1, 0);
          this.meshes.push(cube);
        }

        this.on('mouseMoved', function(e) {
          this.mouseX = e.x;
          this.mouseY = e.y;
        }.bind(this));

        this.framerate(30);
      },
      draw: function() {
        var gl = Core.Context.currentContext.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var ray = this.camera.getWorldRay(this.mouseX, this.mouseY, this.width, this.height);

        var closesHit;

        this.meshes.forEach(function(mesh, i) {
          var hits = ray.hitTestSphere(mesh.position, 0.2);
          if (hits.length > 0) {
            if (!closesHit) {
              closesHit = {
                mesh: mesh,
                position: mesh.position,
                dist : mesh.position.distance(this.camera.getPosition())
              }
            }
            else {
              var dist = hits[0].distance(this.camera.getPosition())
              if (dist < closesHit.dist) {
                closesHit = {
                  mesh: mesh,
                  position: mesh.position,
                  dist : dist
                }
              }
            }
          }
        }.bind(this));

        this.meshes.forEach(function(mesh, i) {
          if (closesHit && closesHit.mesh == mesh) mesh.setMaterial(this.hitMaterial);
          else mesh.setMaterial(this.defaultMaterial);
          mesh.draw(this.camera);
        }.bind(this));
      }
    });
  }
);

