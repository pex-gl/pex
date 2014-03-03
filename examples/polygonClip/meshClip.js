(function() {
  var Arcball, Color, Cube, LineBuilder, Mesh, PerspectiveCamera, Plane, ShowColors, SolidColor, Texture2D, Vec3, hem, pex, _ref, _ref1, _ref2, _ref3, _ref4;

  pex = pex || require('../../build/pex');

  _ref = pex.geom, Vec3 = _ref.Vec3, hem = _ref.hem, Plane = _ref.Plane;

  _ref1 = pex.geom.gen, LineBuilder = _ref1.LineBuilder, Cube = _ref1.Cube;

  Color = pex.color.Color;

  _ref2 = pex.gl, Mesh = _ref2.Mesh, Texture2D = _ref2.Texture2D;

  _ref3 = pex.materials, ShowColors = _ref3.ShowColors, SolidColor = _ref3.SolidColor;

  _ref4 = pex.scene, PerspectiveCamera = _ref4.PerspectiveCamera, Arcball = _ref4.Arcball;

  pex.require(['Plane', 'Line3d'], function(Plane, Line3D) {
    return pex.sys.Window.create({
      settings: {
        width: 1280,
        height: 720,
        type: '3d'
      },
      init: function() {
        var geom, hemesh, lineBuilder, numFaces, plane;
        geom = new Cube();
        geom.computeEdges();
        hemesh = hem().fromGeometry(geom);
        lineBuilder = new LineBuilder();
        plane = new Plane(Vec3.create(0, 0.2, 0), Vec3.create(0.7, 1, 0).normalize());
        numFaces = hemesh.faces.length;
        hemesh.faces.forEach(function(face, faceIndex) {
          var hits, splitEdge0, splitEdge1;
          if (faceIndex >= numFaces) {
            return;
          }
          hits = [];
          if (faceIndex === 3) {
            console.log('face', faceIndex + '/' + hemesh.faces.length);
          }
          face.edgePairLoop(function(e, ne) {
            var edgeLine, p;
            edgeLine = new Line3D(e.vert.position, ne.vert.position);
            if (faceIndex === 3) {
              console.log('line', e.vert.position.toString(), ne.vert.position.toString());
            }
            p = plane.intersectSegment(edgeLine);
            if (faceIndex === 3) {
              if (p) {
                console.log(' ', p.toString(), p.ratio);
              }
            }
            if (p && p.ratio >= 0 && p.ratio <= 1) {
              if (hits.length === 0 || !hits[hits.length - 1].point.equals(p)) {
                hits.push({
                  edge: e,
                  point: p,
                  ratio: p.ratio
                });
              }
            }
            if (p) {
              return lineBuilder.addCross(p, 0.05, Color.Red);
            }
          });
          if (faceIndex === 3) {
            console.log(' ', hits.length, 'hits', hits.map(function(v) {
              return [v.point.toString(), v.ratio];
            }));
          }
          if (hits.length > 2) {
            if (hits[0].point.equals(hits[1].point) || hits[0].point.equals(hits[2].point)) {
              hits.splice(0, 1);
              if (faceIndex === 3) {
                console.log(' ', hits.length, 'hits', hits.map(function(v) {
                  return v.point.toString();
                }));
              }
            }
          }
          if (hits.length === 2) {
            console.log(' split');
            splitEdge0 = hits[0].edge;
            splitEdge1 = hits[1].edge;
            if (hits[0].ratio > 0) {
              hemesh.splitEdge(splitEdge0, hits[0].ratio);
              splitEdge0 = splitEdge0.next;
            }
            if (hits[1].ratio > 0) {
              hemesh.splitEdge(splitEdge1, hits[1].ratio);
              splitEdge1 = splitEdge1.next;
            }
            return hemesh.splitFace(splitEdge0, splitEdge1);
          }
        });
        hemesh.edges.map(function(e) {
          return lineBuilder.addLine(e.vert.position, e.next.vert.position, Color.White);
        });
        hemesh.faces.map(function(face, faceIndex) {
          var c, center, d, faceColor;
          c = face.getCenter();
          d = 0.05;
          center = face.getCenter();
          faceColor = plane.isPointAbove(center) ? Color.Red : Color.Yellow;
          return face.edgePairLoop(function(e, ne) {
            var nv, v;
            v = e.vert.position.dup().scale(1 - d).add(c.dup().scale(d));
            nv = ne.vert.position.dup().scale(1 - d).add(c.dup().scale(d));
            lineBuilder.addLine(v, nv, faceColor);
            return lineBuilder.addCross(v, 0.02, Color.Orange);
          });
        });
        this.mainMesh = new Mesh(lineBuilder, new ShowColors(), {
          useEdges: true
        });
        this.camera = new PerspectiveCamera(60, this.width / this.height, 0.1, 100);
        this.arcball = new Arcball(this, this.camera);
        return null;
      },
      draw: function() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        return this.mainMesh.draw(this.camera);
      }
    });
  });

}).call(this);
