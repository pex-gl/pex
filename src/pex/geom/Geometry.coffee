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
      @addIndices(indices) if indices
      @addEdges(edges) if edges
      @addFaces(faces) if faces

    addAttrib: (propertyName, attributeName, data=null, dynamic=false) ->
      @[propertyName] = if data and data.length then data else []
      @[propertyName].name = attributeName
      @[propertyName].dirty = true
      @[propertyName].dynamic = dynamic
      @attribs[propertyName] = @[propertyName]
      this

    addFaces: (data=null, dynamic=false) ->
      @faces = if data and data.length then data else []
      @faces.dirty = true
      @faces.dynamic = false
      this

    addEdges: (data=null, dynamic=false) ->
      @edges = if data and data.length then data else []
      @edges.dirty = true
      @edges.dynamic = false
      this

    addIndices: (data=null, dynamic=false) ->
      @indices = if data and data.length then data else []
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

    addEdge: (a, b) ->
      @addEdges() if !@edges
      @edgeHash = [] if !@edgeHash
      ab = a + '_' + b
      ba = b + '_' + a
      if !@edgeHash[ab] && !@edgeHash[ba]
        @edges.push(new Edge(a, b))
        @edgeHash[ab] = @edgeHash[ba] = true

    computeEdges: () ->
      if @edges then @edges.length = 0 else @edges = []
      if @faces && @faces.length
        for face in @faces
          if face instanceof Face3
            @addEdge(face.a, face.b)
            @addEdge(face.b, face.c)
            @addEdge(face.c, face.a)
          if face instanceof Face4
            @addEdge(face.a, face.b)
            @addEdge(face.b, face.c)
            @addEdge(face.c, face.d)
            @addEdge(face.d, face.a)
      else
        for i in [0..@vertices.length-1] by 3
          a = i
          b = i + 1
          c = i + 2
          @addEdge(a, b)
          @addEdge(b, c)
          @addEdge(c, a)