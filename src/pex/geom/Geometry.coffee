define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Vec4 = require('pex/geom/Vec4')
  Edge = require('pex/geom/Edge')
  Face3 = require('pex/geom/Face3')
  Face4 = require('pex/geom/Face4')
  Color = require('pex/color/Color')

  elementSizeMap =
    'Vec2': 2
    'Vec3': 3
    'Vec4': 4
    'Color': 4

  class Geometry
    constructor: (attribs) ->
      @faces = []
      @edges = []
      @attribs = attribs || {}

      for attribName, attrib of @attribs
        attrib.isDirty = true;
        attrib.elementSize = elementSizeMap[attrib.type];
        attrib.data = []
        attrib.length = attrib.length ? 0

    allocate: (numVertices) ->
      for attribName, attrib of @attribs
        attrib.length = numVertices
        for i in [0..numVertices-1] by 1
          if not attrib.data[i]?
            switch attrib.type
              when 'Vec2' then attrib.data[i] = new Vec2()
              when 'Vec3' then attrib.data[i] = new Vec3()
              when 'Vec4' then attrib.data[i] = new Vec4()
              when 'Color' then attrib.data[i] = new Color()

    addEdge: (a, b) ->
      @edges = [] if !@edges
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
          @addEdge(face.d, face.a)