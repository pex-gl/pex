define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Face4 = require('pex/geom/Face4')
  Geometry = require('pex/geom/Geometry')

  class Cube extends Geometry
    constructor: (sx, sy, sz, nx, ny, nz) ->
      sx = sx || 1
      sy = sy || sx || 1
      sz = sz || sx || 1
      nx = nx || 1
      ny = ny || 1
      nz = nz || 1

      numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2

      super({vertices:true, normals:true, texCoords:true, faces:true})

      vertexIndex = 0

      makePlane = (u, v, w, su, sv, nu, nv, pw, flipu, flipv) =>
        vertShift = vertexIndex
        for j in [0..nv]
          for i in [0..nu]
            vert = @vertices[vertexIndex] = Vec3.create()
            vert[u] = (-su/2 + i*su/nu) * flipu
            vert[v] = (-sv/2 + j*sv/nv) * flipv
            vert[w] = pw

            normal = @normals[vertexIndex] = Vec3.create()
            normal[u] = 0
            normal[v] = 0
            normal[w] = pw/Math.abs(pw)

            texCoord = @texCoords[vertexIndex] = Vec2.create()
            texCoord.x = i/nu
            texCoord.y = 1.0 - j/nv

            ++vertexIndex;

        for j in [0..nv-1]
          for i in [0..nu-1]
            n = vertShift + j * (nu + 1) + i
            face = new Face4(n, n + nu  + 1, n + nu + 2, n + 1)
            @faces.push(face)

      makePlane('x', 'y', 'z', sx, sy, nx, ny,  sz/2,  1, -1) #front
      makePlane('x', 'y', 'z', sx, sy, nx, ny, -sz/2, -1, -1) #back
      makePlane('z', 'y', 'x', sz, sy, nz, ny, -sx/2,  1, -1) #left
      makePlane('z', 'y', 'x', sz, sy, nz, ny,  sx/2, -1, -1) #right
      makePlane('x', 'z', 'y', sx, sz, nx, nz,  sy/2,  1,  1) #top
      makePlane('x', 'z', 'y', sx, sz, nx, nz, -sy/2,  1, -1) #bottom