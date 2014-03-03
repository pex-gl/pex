(function() {
  var Arcball, Color, Cube, Diffuse, Mesh, ObjReader, ObjWriter, PerspectiveCamera, ShowColors, ShowDepth, ShowNormals, SolidColor, Sphere, Time, Vec3, Vec4, hem, pex, random, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.geom, hem = _ref.hem, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4;

  Color = pex.color.Color;

  _ref1 = pex.scene, PerspectiveCamera = _ref1.PerspectiveCamera, Arcball = _ref1.Arcball;

  _ref2 = pex.materials, ShowNormals = _ref2.ShowNormals, Diffuse = _ref2.Diffuse, SolidColor = _ref2.SolidColor, ShowColors = _ref2.ShowColors, ShowDepth = _ref2.ShowDepth;

  _ref3 = pex.utils, Time = _ref3.Time, ObjReader = _ref3.ObjReader, ObjWriter = _ref3.ObjWriter;

  _ref4 = pex.geom.gen, Cube = _ref4.Cube, Sphere = _ref4.Sphere;

  Mesh = pex.gl.Mesh;

  random = Math.random;

  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      fullscreen: pex.sys.Platform.isBrowser
    },
    init: function() {
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.camera = new PerspectiveCamera(60, this.width / this.height);
      this.arcball = new Arcball(this, this.camera, 3);
      this.material = new ShowColors();
      this.framerate(30);
      return ObjReader.load('mesh.obj', (function(_this) {
        return function(geom) {
          var c, i, v, _i, _ref5;
          geom.addAttrib('colors', 'color');
          for (i = _i = 0, _ref5 = geom.vertices.length - 1; _i <= _ref5; i = _i += 3) {
            v = geom.vertices[i];
            c = new Color(random(), random(), random(), 1);
            geom.colors.push(c);
            geom.colors.push(c);
            geom.colors.push(c);
          }
          return _this.mesh = new Mesh(geom, _this.material);
        };
      })(this));
    },
    draw: function() {
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.depthFunc(this.gl.LEQUAL);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      if (this.mesh) {
        return this.mesh.draw(this.camera);
      }
    }
  });

}).call(this);
