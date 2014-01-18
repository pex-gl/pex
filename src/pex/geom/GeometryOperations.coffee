define (require) ->
  Face3 = require('pex/geom/Face3')
  Face4 = require('pex/geom/Face4')
  Geometry = require('pex/geom/Geometry')

  Geometry.prototype.translate = (v) ->
    @vertices.forEach (vert) -> vert.add(v)

  Geometry.prototype.scale = (s) ->
    @vertices.forEach (vert) -> vert.scale(s)

  Geometry.prototype.rotate = (q) ->
    @vertices.forEach (vert) -> vert.transformQuat(q)

  Geometry.merge = (a, b) ->
    vertices = a.vertices.concat(b.vertices);
    geom = new Geometry({vertices:vertices})
    vertexOffset = a.vertices.length;

    if a.faces and b.faces
      faceOffset = a.faces.length
      faces = []

      for i in [0..a.faces.length-1]
        face = a.faces[i]
        if face instanceof Face3
          faces.push new Face3(face.a, face.b, face.c)
        else faces.push new Face4(face.a, face.b, face.c, face.d)  if face instanceof Face4

      for i in [0..b.faces.length-1]
        face = b.faces[i]
        if face instanceof Face3
          faces.push new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset)
        else faces.push new Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset)  if face instanceof Face4

      geom.faces = faces

    #attribs = ['']

    if a.normals and b.normals
      normals = []

      for i in [0..a.normals.length-1]
        normals.push(a.normals[i].dup())

      for i in [0..b.normals.length-1]
        normals.push(b.normals[i].dup())
      geom.addAttrib('normals', 'normal', normals)

    if a.texCoords and b.texCoords
      texCoords = []

      for i in [0..a.texCoords.length-1]
        texCoords.push(a.texCoords[i].dup())

      for i in [0..b.texCoords.length-1]
        texCoords.push(b.texCoords[i].dup())
      geom.addAttrib('texCoords', 'texCoord', texCoords)

    if a.colors and b.colors
      colors = []

      for i in [0..a.colors.length-1]
        colors.push(a.colors[i].dup())

      for i in [0..b.colors.length-1]
        colors.push(b.colors[i].dup())
      geom.addAttrib('colors', 'color', colors)
    geom

  Geometry