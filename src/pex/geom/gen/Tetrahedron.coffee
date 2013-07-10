define (require) ->
  Vec3 = require('pex/geom/Vec3')
  Face3 = require('pex/geom/Face3')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')

  #Regular tetrahedron
  #http://mathworld.wolfram.com/RegularTetrahedron.html
  class Tetrahedron extends Geometry
    constructor: (a=1) ->

      s3 = Math.sqrt(3)
      s6 = Math.sqrt(6)

      vertices = [
        new Vec3( s3/3*a, -s6/3 * a*0.333 + s6*0.025,    0),   #right
        new Vec3(-s3/6*a, -s6/3 * a*0.333 + s6*0.025,  a/2),   #left front
        new Vec3(-s3/6*a, -s6/3 * a*0.333 + s6*0.025, -a/2),   #left back
        new Vec3(      0,  s6/3 * a*0.666 + s6*0.025,    0)    #top
      ];

      faces = [
        new Face3(0, 1, 2),
        new Face3(3, 1, 0),
        new Face3(3, 0, 2),
        new Face3(3, 2, 1)
      ]

      edges = [
        new Edge(0, 1),
        new Edge(0, 2),
        new Edge(0, 3),
        new Edge(1, 2),
        new Edge(1, 3),
        new Edge(2, 3)
      ]

      super({vertices:vertices, faces:faces, edges:edges})

      #@computeNormals()