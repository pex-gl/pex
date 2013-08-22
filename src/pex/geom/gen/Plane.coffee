#Plane geometry generator.

# ## Parent class : [Geometry](../core/Geometry.html)

# ## Example use
#      var plane = new Plane(1, 1, 10, 10, 'x', 'y')
#      var planeMesh = new Mesh(plane, new Materials.TestMaterial());

define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Face4 = require('pex/geom/Face4')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')

  class Plane extends Geometry
    constructor: (su, sv, nu, nv, u, v) ->
      su = su || 1
      sv = sv || su || 1
      nu = nu || 1
      nv = nv || nu || 1
      u = u || 'x'
      v = v || 'y'

      w = ['x', 'y', 'z']
      w.splice(w.indexOf(u), 1)
      w.splice(w.indexOf(v), 1)
      w = w[0]

      vertices = []
      texCoords = []
      normals = []
      faces = []
      edges = []

      # How faces are constructed:
      #
      #     0-----1 . . 2       n  <----  n+1
      #     |   / .     .       |         A
      #     | /   .     .       V         |
      #     3 . . 4 . . 5      n+nu --> n+nu+1
      #     .     .     .
      #     .     .     .
      #     6 . . 7 . . 8
      #
      for j in [0..nv]
        for i in [0..nu]
          vert = new Vec3()
          vert[u] = (-su/2 + i*su/nu)
          vert[v] = (-sv/2 + j*sv/nv)
          vert[w] = 0
          vertices.push(vert)

          texCoord = new Vec2(i/nu, 1.0 - j/nv)
          texCoords.push(texCoord)

          normal = new Vec3()
          normal[u] = 0
          normal[v] = 0
          normal[w] = 1
          normals.push(normal)

      for j in [0..nv]
        for i in [0..nu]
          n = j * (nu + 1) + i

          if j < nv && i < nu
            face = new Face4(n, n + nu  + 1, n + nu + 2, n + 1)

          edges.push(new Edge(n, n + 1))
          edges.push(new Edge(n, n + nu + 1))

          if j == nv - 1 then edges.push(new Edge(n + nu + 1, n + nu + 2))
          if i == nu - 1 then edges.push(new Edge(n + 1, n + nu + 2))
          faces.push(face)

      super({ vertices: vertices, normals: normals, texCoords: texCoords, faces: faces, edges: edges })