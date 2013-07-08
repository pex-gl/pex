define (require) ->
  Context = require('pex/gl/Context')
  { Vec2, Vec3, Vec4, Edge, Face3, Face4, FacePolygon } = require('pex/geom')
  { Color } = require('pex/color')

  class Buffer
    constructor: (target, type, data, usage) ->
      @gl = Context.currentContext.gl
      @target = target
      @type = type
      @usage = usage || gl.STATIC_DRAW
      @dataBuf = null
      @update(data, @usage) if data

    dispose: () ->
      @gl.deleteBuffer(@handle)
      @handle = null

    update: (data, usage) ->
      @handle = @gl.createBuffer() if !@handle
      @usage = usage || @usage

      return if !data || data.length == 0

      if !isNaN(data[0])
        if !@dataBuf || @dataBuf.length != data.length
          @dataBuf = new @type(data.length)
        for v, i in data
          @dataBuf[i] = v
          @elementSize = 1

      else if data[0] instanceof Vec2
        if !@dataBuf || @dataBuf.length != data.length * 2
          @dataBuf = new @type(data.length * 2)
          @elementSize = 2
        for v, i in data
          @dataBuf[i * 2 + 0] = v.x
          @dataBuf[i * 2 + 1] = v.y

      else if data[0] instanceof Vec3
        if !@dataBuf || @dataBuf.length != data.length * 3
          @dataBuf = new @type(data.length * 3)
          @elementSize = 3
        for v, i in data
          @dataBuf[i * 3 + 0] = v.x
          @dataBuf[i * 3 + 1] = v.y
          @dataBuf[i * 3 + 2] = v.z

      else if data[0] instanceof Vec4
        if !@dataBuf || @dataBuf.length != data.length * 4
          @dataBuf = new @type(data.length * 4)
          @elementSize = 4
        for v, i in data
          @dataBuf[i * 4 + 0] = v.x
          @dataBuf[i * 4 + 1] = v.y
          @dataBuf[i * 4 + 2] = v.z
          @dataBuf[i * 4 + 3] = v.w

      else if data[0] instanceof Color
        if !@dataBuf || @dataBuf.length != data.length * 4
          @dataBuf = new @type(data.length * 4)
          @elementSize = 4
        for v, i in data
          @dataBuf[i * 4 + 0] = v.r
          @dataBuf[i * 4 + 1] = v.g
          @dataBuf[i * 4 + 2] = v.b
          @dataBuf[i * 4 + 3] = v.a

      else if data[0] instanceof Edge
        if !@dataBuf || @dataBuf.length != data.length * 2
          @dataBuf = new @type(data.length * 2)
          @elementSize = 1
        for e, i in data
          @dataBuf[i * 2 + 0] = e.a
          @dataBuf[i * 2 + 1] = e.b

      else if (data[0] instanceof Face3) or (data[0] instanceof Face4) or (data[0] instanceof FacePolygon)
        numIndices = 0
        for face in data
          numIndices += 3 if face instanceof Face3
          numIndices += 6 if face instanceof Face4
          throw 'FacePolygons are not supported in RenderableGeometry Buffers' if face instanceof FacePolygon
        if !@dataBuf || @dataBuf.length != numIndices
          @dataBuf = new @type(numIndices)
          @elementSize = 1
        index = 0
        for face in data
          if face instanceof Face3
            @dataBuf[index + 0] = face.a
            @dataBuf[index + 1] = face.b
            @dataBuf[index + 2] = face.c
            index += 3
          if face instanceof Face4
            @dataBuf[index + 0] = face.a
            @dataBuf[index + 1] = face.b
            @dataBuf[index + 2] = face.d
            @dataBuf[index + 3] = face.d
            @dataBuf[index + 4] = face.b
            @dataBuf[index + 5] = face.c
            index += 6

      else console.log('Buffer.unknown type', data.name, data[0])

      @gl.bindBuffer(@target, @handle)
      @gl.bufferData(@target, @dataBuf, @usage)
