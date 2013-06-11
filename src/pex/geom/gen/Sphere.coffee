define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Face3 = require('pex/geom/Face3')
  Face4 = require('pex/geom/Face4')
  Geometry = require('pex/geom/Geometry')

  class Sphere extends Geometry
    constructor: (r=0.5, nsides=36, nsegments=18) ->
      numVertices = (nsides + 1) * (nsegments + 1)
      vertexIndex = 0

      super({vertices:true, normals:true, texCoords:true, faces:true})

      degToRad = 1/180.0 * Math.PI

      dtheta = 180.0/nsegments
      dphi   = 360.0/nsides

      evalPos = (pos, theta, phi) ->
        pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
        pos.y = r * Math.cos(theta * degToRad);
        pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);

      theta = 0
      segment = 0

      for segment in [0..nsegments]
        theta = segment * dtheta
        for side in [0..nsides]
          phi = side * dphi
          vert = @vertices[vertexIndex] = Vec3.create()
          normal = @normals[vertexIndex] = Vec3.create()
          texCoord = @texCoords[vertexIndex] = Vec2.create()
          evalPos(vert, theta, phi)

          normal.copy(vert).normalize();
          texCoord.set(phi/360.0, theta/180.0);

          ++vertexIndex

          continue if segment == nsegments
          continue if side == nsides

          if segment < nsegments - 1
            @faces.push(new Face3(
              (segment  )*(nsides+1) + side,
              (segment+1)*(nsides+1) + side,
              (segment+1)*(nsides+1) + side + 1
            ))

          if segment > 0
            @faces.push(new Face3(
              (segment  )*(nsides+1) + side,
              (segment+1)*(nsides+1) + side + 1,
              (segment  )*(nsides+1) + side + 1
            ))