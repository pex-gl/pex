define (require) ->
  { IO } = require 'pex/sys'

  ObjWriter = { }

  ObjWriter.save = (geometry, fileName, callback) ->
    s = ObjWriter.stringify(geometry)

    if fileName.indexOf('/') != -1
      IO.saveTextFile(fileName, s, callback)
    else
      if IO.getWorkingDirectory().length > 0
        IO.saveTextFile(IO.getWorkingDirectory() + '/' + fileName, s, callback)
      else
        IO.saveTextFile(fileName, s, callback)

  ObjWriter.stringify = (geometry) ->
    geometries = null
    if Object.prototype.toString.call( geometry ) == '[object Array]'
      geometries = geometry
    else
      geometries = [ geometry ]

    vertexOffset = 0
    vertexCount = 0

    s = '#Obj v1.0\n'

    geometries.forEach (geometry, id) ->
      vertexOffset += vertexCount
      vertexCount = 0

      s += 'o Mesh' + id + '\n';
      geometry.vertices.forEach (v) ->
        s += 'v ' + v.x + ' ' + v.y + ' ' + v.z + '\n';
        vertexCount++;

      if geometry.faces && geometry.faces.length > 0
        geometry.faces.forEach (f) ->
          s += 'f ' + (f.a+1) + ' ' + (f.b+1) + ' ' + (f.c+1)
          if f.d then s += ' ' + (f.d+1)
          s  += '\n'
      else
        for i in [0..geometry.vertices.length-1] by 3
          s += 'f ' + (vertexOffset+i+1) + ' ' + (vertexOffset+i+2) + ' ' + (vertexOffset+i+3) + '\n';

    return s

  ObjWriter