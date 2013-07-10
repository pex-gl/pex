define (require) ->
  Vec3 = require('pex/geom/Vec3')
  FacePolygon = require('pex/geom/FacePolygon')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')

  #Based on http://paulbourke.net/geometry/platonic/
  class Dodecahedron extends Geometry
    constructor: (r=1) ->

      phi = (1 + Math.sqrt(5)) / 2
      a = 0.5 * r
      b = 0.5 * r * 1 / phi
      c = 0.5 * r * (2 - phi)

      vertices = [
        new Vec3( c,  0,  a),
        new Vec3(-c,  0,  a),
        new Vec3(-b,  b,  b),
        new Vec3( 0,  a,  c),
        new Vec3( b,  b,  b),
        new Vec3( b, -b,  b),
        new Vec3( 0, -a,  c),
        new Vec3(-b, -b,  b),
        new Vec3( c,  0, -a),
        new Vec3(-c,  0, -a),
        new Vec3(-b, -b, -b),
        new Vec3( 0, -a, -c),
        new Vec3( b, -b, -b),
        new Vec3( b,  b, -b),
        new Vec3( 0,  a, -c),
        new Vec3(-b,  b, -b),
        new Vec3( a,  c,  0),
        new Vec3(-a,  c,  0),
        new Vec3(-a, -c,  0),
        new Vec3( a, -c,  0)
      ]

      faces = [
        new FacePolygon([ 4,  3,  2,  1,  0]),
        new FacePolygon([ 7,  6,  5,  0,  1]),
        new FacePolygon([12, 11, 10,  9,  8]),
        new FacePolygon([15, 14, 13,  8,  9]),
        new FacePolygon([14,  3,  4, 16, 13]),
        new FacePolygon([ 3, 14, 15, 17,  2]),
        new FacePolygon([11,  6,  7, 18, 10]),
        new FacePolygon([ 6, 11, 12, 19,  5]),
        new FacePolygon([ 4,  0,  5, 19, 16]),
        new FacePolygon([12,  8, 13, 16, 19]),
        new FacePolygon([15,  9, 10, 18, 17]),
        new FacePolygon([ 7,  1,  2, 17, 18])
      ]

      edges = [
        new Edge( 0,  1),
        new Edge( 0,  4),
        new Edge( 0,  5),
        new Edge( 1,  2),
        new Edge( 1,  7),
        new Edge( 2,  3),
        new Edge( 2, 17),
        new Edge( 3,  4),
        new Edge( 3, 14),
        new Edge( 4, 16),
        new Edge( 5,  6),
        new Edge( 5, 19),
        new Edge( 6,  7),
        new Edge( 6, 11),
        new Edge( 7, 18),
        new Edge( 8,  9),
        new Edge( 8, 12),
        new Edge( 8, 13),
        new Edge( 9, 10),
        new Edge( 9, 15),
        new Edge(10, 11),
        new Edge(10, 18),
        new Edge(11, 12),
        new Edge(12, 19),
        new Edge(13, 14),
        new Edge(13, 16),
        new Edge(14, 15),
        new Edge(15, 17),
        new Edge(16, 19),
        new Edge(17, 18)
      ]

      super({vertices:vertices, faces:faces, edges:edges})

      #@computeNormals()