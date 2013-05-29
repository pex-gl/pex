define (require) ->
  Vec2 = require('pex/geom/Vec2')
  Vec3 = require('pex/geom/Vec3')
  Vec4 = require('pex/geom/Vec4')
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
        attrib.buf = new Float32Array(attrib.elementSize * attrib.length)

    allocate: (numVertices) ->
      for attribName, attrib of @attribs
        for i in [0..numVertices-1] by 1
          if not attrib.data[i]?
            switch attrib.type
              when 'Vec2' then attrib.data[i] = new Vec2()
              when 'Vec3' then attrib.data[i] = new Vec3()
              when 'Vec4' then attrib.data[i] = new Vec4()
              when 'Color' then attrib.data[i] = new Color()
