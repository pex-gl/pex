(function() {
  var Arcball, Color, Cube, Diffuse, Dodecahedron, HexSphere, Icosahedron, Mesh, Octahedron, PerspectiveCamera, Plane, Rect, Scene, SolidColor, Sphere, Tetrahedron, Viewport, hem, numCols, numRows, pex, viewportSize, windowHeight, windowWidth, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.scene, Scene = _ref.Scene, PerspectiveCamera = _ref.PerspectiveCamera, Arcball = _ref.Arcball;

  _ref1 = pex.gl, Mesh = _ref1.Mesh, Viewport = _ref1.Viewport;

  _ref2 = pex.materials, SolidColor = _ref2.SolidColor, Diffuse = _ref2.Diffuse;

  Color = pex.color.Color;

  _ref3 = pex.geom, Rect = _ref3.Rect, hem = _ref3.hem;

  _ref4 = pex.geom.gen, Plane = _ref4.Plane, Cube = _ref4.Cube, Tetrahedron = _ref4.Tetrahedron, Octahedron = _ref4.Octahedron, Icosahedron = _ref4.Icosahedron, Dodecahedron = _ref4.Dodecahedron, HexSphere = _ref4.HexSphere, Sphere = _ref4.Sphere;

  numRows = 2;

  numCols = 4;

  viewportSize = 256;

  windowWidth = viewportSize * numCols;

  windowHeight = viewportSize * numRows;

  pex.sys.Window.create({
    settings: {
      width: windowWidth,
      height: windowHeight,
      fullscreen: pex.sys.Platform.isBrowser
    },
    init: function() {
      var geom, i, obj, x, y, _i, _ref5, _results;
      this.camera = new PerspectiveCamera(60, 1);
      this.arcball = new Arcball(this, this.camera);
      this.scene = new Scene();
      this.objects = [];
      _results = [];
      for (i = _i = 0, _ref5 = numCols * numRows; 0 <= _ref5 ? _i < _ref5 : _i > _ref5; i = 0 <= _ref5 ? ++_i : --_i) {
        if (i === 0) {
          geom = hem().fromGeometry(new Cube()).toFlatGeometry();
        } else if (i === 1) {
          geom = hem().fromGeometry(new Cube()).subdivide().toFlatGeometry();
        } else if (i === 2) {
          geom = hem().fromGeometry(new Cube()).smoothDooSabin().toFlatGeometry();
        } else if (i === 3) {
          geom = hem().fromGeometry(new Cube());
          geom.vertices[0].sharp = true;
          geom.subdivide().subdivide().subdivide();
          geom = geom.toFlatGeometry();
        } else if (i === 4) {
          geom = hem().fromGeometry(new Cube(1, 0.1, 1, 1, 1, 3));
          geom.vertices[0].sharp = true;
          geom.subdivide().subdivide().subdivide();
          geom = geom.toFlatGeometry();
        } else if (i === 5) {
          geom = hem().fromGeometry(new Cube(1, 0.1, 1, 3, 1, 3));
          geom.selectFacesBy(function(f) {
            var c, n;
            c = f.getCenter();
            n = f.getNormal();
            return c.length() < 0.1 && n.y > 0;
          });
          geom.extrude(0.5);
          geom = geom.toFlatGeometry();
        } else if (i === 6) {
          geom = hem().fromGeometry(new Cube(1, 1, 1, 3, 3, 3));
          geom.subdivide();
          geom.selectRandomFaces();
          geom.extrude(0.15);
          geom = geom.toFlatGeometry();
        } else if (i === 7) {
          geom = hem().fromGeometry(new Cube(1));
          geom.faces[0].edgePairLoop(function(e, ne) {
            e.sharp = true;
            return e.pair.sharp = true;
          });
          geom.subdivide().subdivide();
          geom = geom.toFlatGeometry();
        } else {
          continue;
        }
        geom.computeEdges();
        x = i % numCols;
        y = Math.floor(i / numCols);
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
      this.gl.lineWidth(2);
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
