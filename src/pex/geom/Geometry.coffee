define (require) ->
  elementSizeMap =
    'Vec2': 2
    'Vec3': 3
    'Vec4': 4

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