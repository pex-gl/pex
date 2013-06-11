define (require) ->
  # Untility class binding Geometry data, Material style used for rendering and 3d transforms in one place.

  # ## Example use
  #      var material = new Materials.TestMaterial();
  #      var camera = new PerspectiveCamera();
  #
  #      var cube = new Mesh(new Cube(), material);
  #      cube.position.x = 1;
  #      cube.rotation = new Vec4(0, 1, 0, Math.PI/2);
  #      cube.draw(camera);

  # ## Reference

  Context = require('pex/gl/Context')
  { Vec3, Quat, Mat4, Face3, Face4 } = require('pex/geom')

  class Mesh
    # ### Mesh ( meshData, material, options )
    # `meshData` - *{ Vbo }* or *{ Geometry }*
    # `material` - material to use for rendering *{ Material }*
    # `options` - *{ Object }*
    #
    # Default options:
    # `primitiveType` : GL primitive type *{ Number/Int }* = *TRIANGLES*
    # `useEdges` : favor edges instead of faces? *{ Boolean }* = *false*
    #
    # Default mesh transforms:
    # `position` - *{ Vec3 }*  = (0, 0, 0)
    # `rotation` - *{ Vec4 }* = (0, 1, 0, 0)
    # `scale`  - *{ Vec3 }*  = (1, 1, 1)
    #
    # *Note: If Geometry is used as meshData it will be converted into VBOs.*

    constructor : (geometry, material, options) ->
      @gl = Context.currentContext.gl
      @geometry = geometry
      @material = material
      options = options or {}
      @gl = Context.currentContext.gl
      #@primitiveType = (if (options.primitiveType isnt `undefined`) then options.primitiveType else @gl.TRIANGLES)
      @primitiveType = options.primitiveType
      @primitiveType ?= @gl.TRIANGLES
      @primitiveType = @gl.LINES if options.useEdges
      @attributes = {}
      @usage = @gl.STATIC_DRAW
      @addAttrib "position", geometry.attribs.position.data, geometry.attribs.position.elementSize
      @addAttrib "normal", geometry.attribs.normal.data, geometry.attribs.normal.elementSize  if geometry.attribs.normal
      @addAttrib "texCoord", geometry.attribs.texCoord.data, geometry.attribs.texCoord.elementSize  if geometry.attribs.texCoord
      @addAttrib "color", geometry.attribs.color.data, geometry.attribs.color.elementSize  if geometry.attribs.color
      @position = Vec3.create(0, 0, 0)
      @rotation = Quat.create()
      @scale = Vec3.create(1, 1, 1)
      @modelWorldMatrix = Mat4.create()
      @modelViewMatrix = Mat4.create()
      @rotationMatrix = Mat4.create()
      @normalMatrix = Mat4.create()
      @updateIndices(geometry, options.useEdges)

    # ### addAttrib ( name, data, elementSize, usage )
    # `name` - *{ String }*
    # `data` - *{ Array }*
    # `elementSize` - *{ Number/Int }*
    # `usage` - *{ Number/Int }*
    addAttrib: (name, data, elementSize, usage) ->
      elementSize = elementSize or 3
      usage = usage or @usage
      attrib = {}
      attrib.name = name
      attrib.data = data
      attrib.dataBuf = data.buf
      attrib.elementSize = elementSize
      attrib.location = -1
      attrib.buffer = @gl.createBuffer()
      attrib.usage = usage
      @gl.bindBuffer(@gl.ARRAY_BUFFER, attrib.buffer)
      @gl.bufferData(@gl.ARRAY_BUFFER, attrib.dataBuf, usage)
      @attributes[attrib.name] = attrib

    # ### updateIndices ( geometry )
    # `geometry` - *{ Geometry }*
    updateIndices: (geometry, useEdges) ->
      if @indices is `undefined`
        @indices = {}
        @indices.buffer = @gl.createBuffer()
      @indices.isDirty = false
      data = []
      if useEdges and geometry.edges.length > 0
        geometry.edges.forEach (e) -> data.push(e.a, e.b)
      else if geometry.faces.length > 0
        geometry.faces.forEach (face) ->
          if face.constructor is Face4
            data.push face.a
            data.push face.b
            data.push face.d
            data.push face.d
            data.push face.b
            data.push face.c
          if face.constructor is Face3
            data.push face.a
            data.push face.b
            data.push face.c

      @indices.data = new Uint16Array(data)
      oldArrayBinding = @gl.getParameter(@gl.ELEMENT_ARRAY_BUFFER_BINDING)
      @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, @indices.buffer
      @gl.bufferData @gl.ELEMENT_ARRAY_BUFFER, @indices.data, @usage
      @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, oldArrayBinding

    draw: (camera) ->
      programUniforms = @material.program.uniforms
      materialUniforms = @material.uniforms
      if camera
        @updateMatrices camera
        materialUniforms.projectionMatrix = camera.getProjectionMatrix() if programUniforms.projectionMatrix
        materialUniforms.modelViewMatrix = @modelViewMatrix if programUniforms.modelViewMatrix
        materialUniforms.viewMatrix = camera.getViewMatrix() if programUniforms.viewMatrix
        materialUniforms.modelWorldMatrix = @modelWorldMatrix if programUniforms.modelWorldMatrix
        materialUniforms.normalMatrix = @normalMatrix if programUniforms.normalMatrix
      @material.use()
      program = @material.program

      if @indices.isDirty
        @updateIndices(@geometry)

      for name, attrib of @attributes

        # TODO:this should go another way instad of searching for mesh atribs in shader look for required attribs by shader inside mesh
        attrib.location = @gl.getAttribLocation(program.handle, attrib.name) if attrib.location is 'undefined' or attrib.location is -1

        if attrib.location >= 0
          @gl.bindBuffer(@gl.ARRAY_BUFFER, attrib.buffer)
          if @geometry.attribs[name].isDirty
            attrib.dataBuf = @geometry.attribs[name].buf
            if !attrib.dataBuf || !attrib.dataBuf.length / attrib.elementSize < @geometry.attribs[name].data.length
                attrib.dataBuf = @geometry.attribs[name].buf = new Float32Array(@geometry.attribs[name].data.length * attrib.elementSize)
            if @geometry.attribs[name].type is 'Vec2'
              @geometry.attribs[name].data.forEach (v, i) ->
                attrib.dataBuf[i * 2 + 0] = v.x
                attrib.dataBuf[i * 2 + 1] = v.y
            if @geometry.attribs[name].type is 'Vec3'
              @geometry.attribs[name].data.forEach (v, i) ->
                attrib.dataBuf[i * 3 + 0] = v.x
                attrib.dataBuf[i * 3 + 1] = v.y
                attrib.dataBuf[i * 3 + 2] = v.z

            @gl.bufferData(@gl.ARRAY_BUFFER, attrib.dataBuf, attrib.usage)
            @geometry.attribs[name].isDirty = false
          @gl.vertexAttribPointer(attrib.location, attrib.elementSize, @gl.FLOAT, false, 0, 0)
          @gl.enableVertexAttribArray(attrib.location)

      if @indices and @indices.data and @indices.data.length > 0
        @gl.bindBuffer(@gl.ELEMENT_ARRAY_BUFFER, @indices.buffer)
        @gl.drawElements(@primitiveType, @indices.data.length, @gl.UNSIGNED_SHORT, 0)
      else if @attributes["position"]
        num = @attributes["position"].dataBuf.length / 3
        @gl.drawArrays @primitiveType, 0, num
      for name of @attributes
        attrib = @attributes[name]
        @gl.disableVertexAttribArray attrib.location  if attrib.location >= 0

    resetAttribLocations: () ->
      for name of @attributes
        attrib = @attributes[name]
        attrib.location = -1

    updateMatrices: (camera) ->
      @rotation.toMat4(@rotationMatrix);
      @modelWorldMatrix.identity()
        .translate(@position.x, @position.y, @position.z)
        .mul(@rotationMatrix)
        .scale(@scale.x, @scale.y, @scale.z)

      @modelViewMatrix
        .copy(camera.getViewMatrix())
        .mul(@modelWorldMatrix)

      @normalMatrix
        .copy(@modelViewMatrix)
        .invert()
        .transpose()

    getMaterial: ->
      @material

    setMaterial: (material) ->
      @material = material
      @resetAttribLocations()

    getProgram: ->
      @material.program

    setProgram: (program) ->
      @material.program = program
      @resetAttribLocations()

    Mesh
  ###
