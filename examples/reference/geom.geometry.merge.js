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
      this.mesh = new Mesh(geom, new ShowNormals({
        color: Color.White
      }));
      return null;
    },
    draw: function() {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.mesh.draw(this.camera);
      return null;
    }
  });

}).call(this);
