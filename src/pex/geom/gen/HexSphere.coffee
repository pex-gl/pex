define (require) ->
  Vec3 = require('pex/geom/Vec3')
  FacePolygon = require('pex/geom/FacePolygon')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')
  Icosahedron = require('pex/geom/gen/Icosahedron')
  hem = require('pex/geom/hem')

  #Based on http://paulbourke.net/geometry/platonic/
  class HexSphere extends Geometry
    constructor: (r=1, level=2) ->
      baseGeom = new Icosahedron(r)
      he = hem().fromGeometry(baseGeom)
      for i in [0..level-1]
        he.subdivideTriangles();

      vertices = []
      faces = []

      for vertex in he.vertices
        vertexIndex = vertices.length;
        midPoints = [];
        vertex.forEachEdge (edge) ->
          midPoints.push(edge.face.getCenter())

        center = new Vec3(0,0,0)
        center.add(p) for p in midPoints
        center.scale(1 / midPoints.length)

        vertices = vertices.concat(midPoints)

        if midPoints.length == 5
          faces.push(new FacePolygon([vertexIndex+4, vertexIndex+3, vertexIndex+2, vertexIndex+1, vertexIndex]))

        if midPoints.length == 6
          faces.push(new FacePolygon([vertexIndex+5, vertexIndex+4, vertexIndex+3, vertexIndex+2, vertexIndex+1, vertexIndex]));

      for v in vertices
        v.normalize().scale(r/2)

      super({vertices:vertices, faces:faces})

      #@computeNormals()
