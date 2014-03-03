(function() {
  var Arcball, Color, Cube, Diffuse, Dodecahedron, HexSphere, Icosahedron, Mesh, Octahedron, PerspectiveCamera, Plane, Rect, Scene, SolidColor, Sphere, Tetrahedron, Viewport, hem, pex, shapes, shapesPerRow, viewportSize, windowHeight, windowWidth, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.scene, Scene = _ref.Scene, PerspectiveCamera = _ref.PerspectiveCamera, Arcball = _ref.Arcball;

  _ref1 = pex.gl, Mesh = _ref1.Mesh, Viewport = _ref1.Viewport;

  _ref2 = pex.materials, SolidColor = _ref2.SolidColor, Diffuse = _ref2.Diffuse;

  Color = pex.color.Color;

  _ref3 = pex.geom, Rect = _ref3.Rect, hem = _ref3.hem;

  _ref4 = pex.geom.gen, Plane = _ref4.Plane, Cube = _ref4.Cube, Tetrahedron = _ref4.Tetrahedron, Octahedron = _ref4.Octahedron, Icosahedron = _ref4.Icosahedron, Dodecahedron = _ref4.Dodecahedron, HexSphere = _ref4.HexSphere, Sphere = _ref4.Sphere;

  shapes = [Plane, Cube, Tetrahedron, Octahedron, Icosahedron, Dodecahedron, HexSphere, Sphere];

  shapesPerRow = 4;

  viewportSize = 256;

  windowWidth = viewportSize * shapesPerRow;

  windowHeight = viewportSize * Math.ceil(shapes.length / shapesPerRow);

  pex.sys.Window.create({
    settings: {
      width: windowWidth,
      height: windowHeight,
      fullscreen: pex.sys.Platform.isBrowser
    },
    init: function() {
      var geom, i, obj, shape, x, y, _i, _len, _results;
      this.camera = new PerspectiveCamera(60, 1);
      this.arcball = new Arcball(this, this.camera);
      this.scene = new Scene();
      this.objects = [];
      _results = [];
      for (i = _i = 0, _len = shapes.length; _i < _len; i = ++_i) {
        shape = shapes[i];
        geom = null;
        if (shape === Plane) {
          geom = new Plane(1, 1, 3, 3);
        } else if (shape === Cube) {
          geom = new Cube(1, 1, 1, 3, 3, 3);
        } else {
          geom = hem().fromGeometry(new shape()).triangulate().toFlatGeometry();
        }
        geom.computeEdges();
        x = i % shapesPerRow;
        y = Math.floor(i / shapesPerRow);
        obj = {
          solid: new Mesh(geom, new Diffuse({
            diffuseColor: new Color(0.2, 0.2, 0.2, 0.2)
          })),
          wireframe: new Mesh(geom, new SolidColor({
            color: Color.Yellow
          }), {
            useEdges: true
          }),
          viewport: new Viewport(this, new Rect(viewportSize * x, viewportSize * y, viewportSize, viewportSize))
        };
        _results.push(this.objects.push(obj));
      }
      return _results;
    },
    draw: function() {
      var obj, _i, _len, _ref5, _results;
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      _ref5 = this.objects;
      _results = [];
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        obj = _ref5[_i];
        obj.viewport.bind();
        obj.solid.draw(this.camera);
        obj.wireframe.draw(this.camera);
        _results.push(obj.viewport.unbind());
      }
      return _results;
    }
  });

}).call(this);

(function() {
  var Arcball, Color, Cube, Geometry, GeometryOperations, Mesh, PerspectiveCamera, Quat, Scene, ShowNormals, Sphere, Vec3, pex, _ref, _ref1, _ref2;

  pex = pex || require('../../build/pex');

  _ref = pex.scene, Scene = _ref.Scene, PerspectiveCamera = _ref.PerspectiveCamera, Arcball = _ref.Arcball;

  Mesh = pex.gl.Mesh;

  ShowNormals = pex.materials.ShowNormals;

  Color = pex.color.Color;

  _ref1 = pex.geom.gen, Cube = _ref1.Cube, Sphere = _ref1.Sphere;

  _ref2 = pex.geom, Vec3 = _ref2.Vec3, Quat = _ref2.Quat, Geometry = _ref2.Geometry, GeometryOperations = _ref2.GeometryOperations;

  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      fullscreen: pex.sys.Platform.isBrowser
    },
    init: function() {
      var geom, geom1, geom2;
      this.camera = new PerspectiveCamera(60, this.width / this.height);
      this.arcball = new Arcball(this, this.camera);
      geom1 = new Cube();
      geom1.translate(new Vec3(-0.45, 0, 0));
      geom1.rotate(new Quat().setAxisAngle(new Vec3(1, 0, 0), 45));
      geom2 = new Sphere();
      geom2.translate(new Vec3(0.45, 0, 0));
      geom2.scale(1.5);
      geom = Geometry.merge(geom1, geom2);
      return this.mesh = new Mesh(geom, new ShowNormals({
        color: Color.White
      }));
    },
    draw: function() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      return this.mesh.draw(this.camera);
    }
  });

}).call(this);

(function() {
  var Arcball, BoundingBox, Color, Cube, Diffuse, Mesh, PerspectiveCamera, Ray, Rect, Scene, SolidColor, Vec3, Viewport, pex, _ref, _ref1, _ref2, _ref3;

  pex = pex || require('../../build/pex');

  _ref = pex.scene, Scene = _ref.Scene, PerspectiveCamera = _ref.PerspectiveCamera, Arcball = _ref.Arcball;

  _ref1 = pex.gl, Mesh = _ref1.Mesh, Viewport = _ref1.Viewport;

  _ref2 = pex.materials, SolidColor = _ref2.SolidColor, Diffuse = _ref2.Diffuse;

  Color = pex.color.Color;

  _ref3 = pex.geom, Rect = _ref3.Rect, Ray = _ref3.Ray, BoundingBox = _ref3.BoundingBox, Vec3 = _ref3.Vec3;

  Cube = pex.geom.gen.Cube;

  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      fullscreen: pex.sys.Platform.isBrowser
    },
    init: function() {
      var geom;
      this.camera = new PerspectiveCamera(60, this.width / this.height);
      this.arcball = new Arcball(this, this.camera);
      this.scene = new Scene();
      geom = new Cube(1, 1, 1);
      geom.computeEdges();
      this.mesh = new Mesh(geom, new SolidColor({
        color: Color.White
      }), {
        useEdges: true
      });
      this.pointer = new Mesh(new Cube(0.1, 0.1, 0.1), new SolidColor({
        color: Color.Red
      }), {
        useEdges: false
      });
      this.bbox = BoundingBox.fromPositionSize(new Vec3(0, 0, 0), new Vec3(1, 1, 1));
      return this.on('mouseMoved', (function(_this) {
        return function(e) {
          var hits, ray;
          ray = _this.camera.getWorldRay(e.x, e.y, _this.width, _this.height);
          hits = ray.hitTestBoundingBox(_this.bbox);
          if (hits.length > 0) {
            console.log(hits[0]);
            return _this.pointer.position = hits[0];
          }
        };
      })(this));
    },
    draw: function() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.mesh.draw(this.camera);
      return this.pointer.draw(this.camera);
    }
  });

}).call(this);
