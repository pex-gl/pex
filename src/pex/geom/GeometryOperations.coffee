define (require) ->
  Face3 = require('pex/geom/Face3')
  Face4 = require('pex/geom/Face4')
  Geometry = require('pex/geom/Geometry')

  Geometry.prototype.translate = (v) ->
    @vertices.forEach (vert) -> vert.add(v)
    return this

  Geometry.prototype.scale = (s) ->
    @vertices.forEach (vert) -> vert.scale(s)
    return this

  Geometry.prototype.rotate = (q) ->
    @vertices.forEach (vert) -> vert.transformQuat(q)
    return this

  Geometry.merge = (a, b) ->
    vertices = a.vertices.concat(b.vertices).map (v) -> v.dup()
    geom = new Geometry({vertices:vertices})
    vertexOffset = a.vertices.length

    if a.faces and b.faces
      faceOffset = a.faces.length
      faces = []

      for face in a.faces
        if face instanceof Face3
          faces.push new Face3(face.a, face.b, face.c)
        if face instanceof Face4
          faces.push new Face4(face.a, face.b, face.c, face.d)

      for face in b.faces
        if face instanceof Face3
          faces.push new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset)
        if face instanceof Face4
          faces.push new Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset)

      geom.faces = faces

    #attribs = ['']

    if a.normals and b.normals
      normals = []

      for normal in a.normals
        normals.push(normal.dup())

      for normal in b.normals
        normals.push(normal.dup())

      geom.addAttrib('normals', 'normal', normals)

    if a.texCoords and b.texCoords
      texCoords = []

      for texCoord in a.texCoords
        texCoords.push(texCoord.dup())

      for texCoord in b.texCoords
        texCoords.push(texCoord.dup())

      geom.addAttrib('texCoords', 'texCoord', texCoords)

    if a.colors and b.colors
      colors = []

      for color in a.colors
        colors.push(color.dup())

      for color in b.colors
        colors.push(color.dup())

      geom.addAttrib('colors', 'color', colors)
    geom

  Geometry