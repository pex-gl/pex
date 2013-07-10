define (require) ->
  Vec3 = require('pex/geom/Vec3')
  Face3 = require('pex/geom/Face3')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')

  #Based on http://paulbourke.net/geometry/platonic/
  class Octahedron extends Geometry
    constructor: (r=1) ->

      r = r || 1;

      a = r * 1 / (2 * Math.sqrt(2));
      b = r * 1 / 2;

      s3 = Math.sqrt(3)
      s6 = Math.sqrt(6)

      vertices = [
        new Vec3(-a, 0, a),   #front left
        new Vec3( a, 0, a),   #front right
        new Vec3( a, 0,-a),   #back right
        new Vec3(-a, 0,-a),   #back left
        new Vec3( 0, b, 0),   #top
        new Vec3( 0,-b, 0)    #bottom
      ]

      faces = [
        new Face3(3, 0, 4),
        new Face3(2, 3, 4),
        new Face3(1, 2, 4),
        new Face3(0, 1, 4),
        new Face3(3, 2, 5),
        new Face3(0, 3, 5),
        new Face3(2, 1, 5),
        new Face3(1, 0, 5)
      ]

      edges = [
        new Edge(0, 1),
        new Edge(1, 2),
        new Edge(2, 3),
        new Edge(3, 0),
        new Edge(0, 4),
        new Edge(1, 4),
        new Edge(2, 4),
        new Edge(3, 4),
        new Edge(0, 5),
        new Edge(1, 5),
        new Edge(2, 5),
        new Edge(3, 5)
      ]

      super({vertices:vertices, faces:faces, edges:edges})

      #@computeNormals()