(function() {
  var Arcball, Color, Cube, Diffuse, Mesh, ObjReader, ObjWriter, PerspectiveCamera, ShowNormals, Sphere, Time, Vec3, Vec4, hem, pex, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.geom, hem = _ref.hem, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4;

  Color = pex.color.Color;

  _ref1 = pex.scene, PerspectiveCamera = _ref1.PerspectiveCamera, Arcball = _ref1.Arcball;

  _ref2 = pex.materials, ShowNormals = _ref2.ShowNormals, Diffuse = _ref2.Diffuse;

  _ref3 = pex.utils, Time = _ref3.Time, ObjReader = _ref3.ObjReader, ObjWriter = _ref3.ObjWriter;

  _ref4 = pex.geom.gen, Cube = _ref4.Cube, Sphere = _ref4.Sphere;

  Mesh = pex.gl.Mesh;

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
      this.material = new ShowNormals();
      this.selectionMaterial = new Diffuse({
        ambientColor: Color.create(0.2, 0, 0, 1),
        diffuseColor: Color.create(1, 0, 0, 1)
      });
      this.framerate(30);
      this.hem = hem().fromGeometry(new Cube(1, 1, 1)).extrude(0.5).subdivide().extrude(0.1);
      this.geom = this.hem.toFlatGeometry();
      this.mesh = new Mesh(this.geom, this.material);
      return ObjWriter.save(this.geom, 'test.obj');
    },
    draw: function() {
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
