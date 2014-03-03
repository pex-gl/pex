(function() {
  var Arcball, Color, Cube, Diffuse, Mesh, PerspectiveCamera, ShowNormals, Sphere, Time, Turtle, Vec3, Vec4, hem, pex, _ref, _ref1, _ref2, _ref3;

  pex = pex || require('../../build/pex');

  _ref = pex.geom, hem = _ref.hem, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4;

  Color = pex.color.Color;

  _ref1 = pex.scene, PerspectiveCamera = _ref1.PerspectiveCamera, Arcball = _ref1.Arcball;

  _ref2 = pex.materials, ShowNormals = _ref2.ShowNormals, Diffuse = _ref2.Diffuse;

  Time = pex.utils.Time;

  _ref3 = pex.geom.gen, Cube = _ref3.Cube, Sphere = _ref3.Sphere;

  Mesh = pex.gl.Mesh;

  Turtle = (function() {
    function Turtle(hem, face) {
      var avgDist, center, distances, vertices;
      this.hem = hem;
      this.face = face;
      this.direction = Vec3.create().copy(face.getNormal());
      center = face.getCenter();
      avgDist = 0;
      vertices = face.getAllVertices();
      distances = vertices.map(function(v) {
        var dist;
        dist = v.position.distance(center);
        return avgDist += dist;
      });
      this.avgDist = avgDist / vertices.length;
      this.radiusScale = 1;
    }

    Turtle.prototype.move = function(distance) {
      var avgDist, center, distances, radiusScale;
      this.hem.clearFaceSelection().selectFace(this.face).extrude(distance);
      distances = this.distances;
      center = this.face.getCenter();
      radiusScale = this.radiusScale;
      avgDist = this.avgDist;
      return this.face.getAllVertices().forEach(function(v, i) {
        return v.position.sub(center).normalize().scale(avgDist * radiusScale).add(center);
      });
    };

    return Turtle;

  })();

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
    totalLength: 0,
    init: function() {
      var selectedFaces;
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.camera = new PerspectiveCamera(60, this.width / this.height);
      this.arcball = new Arcball(this, this.camera, 3);
      this.material = new ShowNormals();
      this.selectionMaterial = new Diffuse({
        ambientColor: Color.create(0.2, 0, 0, 1),
        diffuseColor: Color.create(1, 0, 0, 1)
      });
      this.framerate(30);
      this.hem = hem().fromGeometry(new Cube(1, 1, 1));
      this.mesh = new Mesh(this.hem.toFlatGeometry(), this.material);
      this.hem.selectRandomFaces().subdivide().selectRandomFaces(1000);
      selectedFaces = this.hem.getSelectedFaces();
      this.turtles = selectedFaces.map((function(_this) {
        return function(face) {
          return new Turtle(_this.hem, face);
        };
      })(this));
      return this.on('keyDown', (function(_this) {
        return function(e) {
          switch (e.str) {
            case 'e':
              _this.hem.extrude(1);
              _this.hem.toFlatGeometry(_this.mesh.geometry);
          }
          switch (e.keyCode) {
            case 48:
              _this.hem.subdivide();
              return _this.hem.toFlatGeometry(_this.mesh.geometry);
          }
        };
      })(this));
    },
    draw: function() {
      var tmp;
      if (this.totalLength < 1 && Time.frameNumber % 5 === 0) {
        tmp = Vec3.create();
        this.turtles.forEach(function(turtle, i) {
          if (Time.seconds < 2) {
            turtle.move(0.1);
          }
          turtle.radiusScale = 0.02 + 0.8 * Math.random();
          turtle.move(0.1);
          turtle.move(0.1);
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 0.8;
          turtle.move(0.05);
          turtle.radiusScale *= 0.8;
          turtle.move(0.05);
          turtle.radiusScale *= 0.8;
          turtle.move(-0.05);
          turtle.radiusScale *= 0.1;
          turtle.move(-0.5);
          turtle.move(0.6);
          turtle.radiusScale *= 2;
          turtle.move(0.1);
          turtle.radiusScale *= 2;
          turtle.move(0.1);
          turtle.radiusScale *= 2;
          return turtle.move(0.1);
        });
        this.hem.toFlatGeometry(this.mesh.geometry);
        this.totalLength += 10.2;
      }
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.depthFunc(this.gl.LEQUAL);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      if (this.mesh) {
        this.mesh.draw(this.camera);
      }
      if (this.selectionMesh) {
        return this.selectionMesh.draw(this.camera);
      }
    }
  });

}).call(this);
