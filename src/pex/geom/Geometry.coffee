define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Vec4 = require('pex/geom/Vec4')
  Edge = require('pex/geom/Edge')
  Face3 = require('pex/geom/Face3')
  Face4 = require('pex/geom/Face4')
  Color = require('pex/color/Color')

  class Geometry
    constructor: ({vertices, normals, texCoords, tangents, colors, indices, edges, faces}) ->
      vertices ?= true
      normals ?= false
      texCoords ?= false
      tangents ?= false
      colors ?= false
      indices ?= false
      edges ?= false
      faces ?= true

      @attribs = {}

      @addAttrib('vertices', 'position', vertices, false) if vertices
      @addAttrib('normals', 'normal', normals, false) if normals
      @addAttrib('texCoords', 'texCoord', texCoords, false) if texCoords
      @addAttrib('tangents', 'tangent', tangents, false) if tangents
      @addAttrib('colors', 'color', colors, false) if colors
      @addIndices() if indices
      @addEdges() if edges
      @addFaces() if faces

    addAttrib: (propertyName, attributeName, data=null, dynamic=false) ->
      @[propertyName] = if data and data.length then data else []
      @[propertyName].name = attributeName
      @[propertyName].dirty = true
      @[propertyName].dynamic = dynamic
      @attribs[propertyName] = @[propertyName]
      this

    addFaces: (dynamic=false) ->
      @faces = []
      @faces.dirty = true
      @faces.dynamic = false
      this

    addEdges: (dynamic=false) ->
      @edges = []
      @edges.dirty = true
      @edges.dynamic = false
      this

    addIndices: (dynamic=false) ->
      @indices = []
      @indices.dirty = true
      @indices.dynamic = false
      this

    isDirty: (attibs) ->
      dirty = false
      dirty ||= @faces && @faces.dirty
      dirty ||= @edges && @edges.dirty
      for attribAlias, attrib of @attribs
        dirty ||= attrib.dirty
      return dirty

    #allocate: (numVertices) ->
    #  for attribName, attrib of @attribs
    #    console.log(attrib)
    #    attrib.length = numVertices
    #
    #    for i in [0..numVertices-1] by 1
    #      if not attrib[i]?
    #        switch attrib.type
    #          when 'Vec2' then attrib[i] = new Vec2()
    #          when 'Vec3' then attrib[i] = new Vec3()
    #          when 'Vec4' then attrib[i] = new Vec4()
    #          when 'Color' then attrib[i] = new Color()

    addEdge: (a, b) ->
      @addEdges() if !@edges
      @edgeHash = [] if !@edgeHash
      ab = a + '_' + b
      ba = a + '_' + a
      if !@edgeHash[ab] && !@edgeHash[ba]
        @edges.push(new Edge(a, b))
        @edgeHash[ab] = @edgeHash[ba] = true

    computeEdges: () ->
      for face in @faces
        if face instanceof Face3
          @addEdge(face.a, face.b)
          @addEdge(face.b, face.c)
          @addEdge(face.c, face.a)
        if face instanceof Face4
          @addEdge(face.a, face.b)
          @addEdge(face.b, face.c)
          @addEdge(face.c, face.d)
          @addEdge(face.d, face.a)#