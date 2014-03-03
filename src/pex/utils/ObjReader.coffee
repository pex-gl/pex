define (require) ->
  { IO } = require 'pex/sys'
  { Geometry, Vec2, Vec3, Face3, Face4 } = require 'pex/geom'

  ObjReader = {}

  ObjReader.load = (file, callback) ->
    IO.loadTextFile file, (text) ->
      geometry = ObjReader.parse(text)
      callback(geometry)

  ObjReader.parse  = (text) ->
    lines = text.trim().split('\n')
    geom = new Geometry({vertices:true, faces:true, normals:true, texCoords:true})

    lines.forEach (line) ->
      matches = null

      if matches = line.match(/v\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)
        x = parseFloat(matches[1])
        y = parseFloat(matches[2])
        z = parseFloat(matches[3])
        geom.vertices.push(new Vec3(x, y, z))

      else if matches = line.match(/vt\s+([^\s]+)\s+([^\s]+)/)
        u = parseFloat(matches[1])
        v = parseFloat(matches[2])
        geom.texCoords.push(new Vec2(u, v))

      else if matches = line.match(/vn\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)
        x = parseFloat(matches[1])
        y = parseFloat(matches[2])
        z = parseFloat(matches[3])
        geom.normals.push(new Vec3(x, y, z))

      else if matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)
        a = parseInt(matches[1])
        b = parseInt(matches[2])
        c = parseInt(matches[3])
        d = parseInt(matches[4])
        if a < 0 then a = geom.vertices.length + a else a--
        if b < 0 then b = geom.vertices.length + b else b--
        if c < 0 then c = geom.vertices.length + c else c--
        if d < 0 then d = geom.vertices.length + d else d--
        geom.faces.push(new Face3(a, b, c))
        geom.faces.push(new Face3(a, c, d))

      else if matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/)
        a = parseInt(matches[1])
        b = parseInt(matches[2])
        c = parseInt(matches[3])
        if a < 0 then a = geom.vertices.length + a else a--
        if b < 0 then b = geom.vertices.length + b else b--
        if c < 0 then c = geom.vertices.length + c else c--
        geom.faces.push(new Face3(a, b, c))

      else
        if (ObjReader.verbose) then console.log('ObjReader unknown line', line)

    if (geom.normals.length == 0) then delete geom.normals
    if (geom.texCoords.length == 0) then delete geom.texCoords

    #if geom.normals.length == 0
    #  geom.computeNormals()

    if (ObjReader.verbose) then console.log("Vertices count " + geom.vertices.length)
    #console.log("Vertices normals " + geom.normals.length)
    if (ObjReader.verbose) then console.log("Vertices faces " + geom.faces.length)

    geom

  ObjReader
