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
      this.on('mouseMoved', (function(_this) {
        return function(e) {
          var hits, ray;
          ray = _this.camera.getWorldRay(e.x, e.y, _this.width, _this.height);
          hits = ray.hitTestBoundingBox(_this.bbox);
          if (hits.length > 0) {
            console.log(hits[0]);
            _this.pointer.position = hits[0];
            return null;
          }
        };
      })(this));
      return null;
    },
    draw: function() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.mesh.draw(this.camera);
      this.pointer.draw(this.camera);
      return null;
    }
  });

}).call(this);
