(function() {
  var Arcball, Color, Cube, Mesh, PerspectiveCamera, Rect, Scene, SolidColor, Sphere, Test, Vec3, Viewport, pex, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.geom, Vec3 = _ref.Vec3, Rect = _ref.Rect;

  _ref1 = pex.geom.gen, Cube = _ref1.Cube, Sphere = _ref1.Sphere;

  _ref2 = pex.gl, Mesh = _ref2.Mesh, Viewport = _ref2.Viewport;

  _ref3 = pex.materials, Test = _ref3.Test, SolidColor = _ref3.SolidColor;

  _ref4 = pex.scene, PerspectiveCamera = _ref4.PerspectiveCamera, Arcball = _ref4.Arcball, Scene = _ref4.Scene;

  Color = pex.color.Color;

  pex.sys.Window.create({
    settings: {
      width: 1200,
      height: 600,
      type: '3d'
    },
    init: function() {
      this.mesh = new Mesh(new Cube(1), new Test());
      this.camera = new PerspectiveCamera(60, 200 / 200);
      this.arcball = new Arcball(this, this.camera, 2);
      this.scene = new Scene();
      this.scene.setClearColor(Color.Red);
      this.scene.add(new Mesh(new Cube(), new Test()));
      this.scene.add(this.camera);
      this.scene.setViewport(new Viewport(this, new Rect(0, 0, 200, 200)));
      this.scene2 = new Scene();
      this.scene2.setClearColor(Color.Green);
      this.scene2.add(new Mesh(new Cube(), new Test()));
      this.scene2.add(this.camera);
      this.scene2.setViewport(new Viewport(this, new Rect(0, 200, 200, 200)));
      this.scene3 = new Scene();
      this.scene3.setClearColor(Color.Blue);
      this.scene3.add(new Mesh(new Cube(), new Test()));
      this.scene3.setViewport(new Viewport(this, new Rect(0, 400, 200, 200)));
      this.scene4 = new Scene();
      this.scene4.setClearColor(Color.Grey);
      this.scene4.add(new Mesh(new Cube(), new Test()));
      return this.scene4.setViewport(new Viewport(this, new Rect(200, 0, this.width - 200, this.height)));
    },
    draw: function() {
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.clearColor(0.0, 0.0, 0.0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.scene.draw(this.camera);
      this.scene2.draw(this.camera);
      this.scene3.draw(this.camera);
      return this.scene4.draw(this.camera);
    }
  });

}).call(this);
