define (require) ->
  Vec3 = require('pex/geom/Vec3')
  Edge = require('pex/geom/Edge')
  Color = require('pex/color/Color')
  Geometry = require('pex/geom/Geometry')

  class LineBuilder extends Geometry
    constructor: () ->
      super({vertices:true, colors:true})

    addLine: (a, b, colorA, colorB) ->
      colorA = colorA || Color.White
      colorB = colorB || colorA

      @vertices.push(Vec3.create().copy(a))
      @vertices.push(Vec3.create().copy(b))

      @colors.push(Color.create().copy(colorA))
      @colors.push(Color.create().copy(colorB))

      @vertices.dirty = true
      @colors.dirty = true

    addCross: (pos, size, color) ->
      size = size || 0.1
      halfSize = size / 2;

      color = color || Color.White

      @positions.push(Vec3.create().set(pos.x - halfSize, pos.y, pos.z))
      @positions.push(Vec3.create().set(pos.x + halfSize, pos.y, pos.z))
      @positions.push(Vec3.create().set(pos.x, pos.y - halfSize, pos.z))
      @positions.push(Vec3.create().set(pos.x, pos.y + halfSize, pos.z))
      @positions.push(Vec3.create().set(pos.x, pos.y, pos.z - halfSize))
      @positions.push(Vec3.create().set(pos.x, pos.y, pos.z + halfSize))

      @colors.push(Color.create().copy(color))
      @colors.push(Color.create().copy(color))
      @colors.push(Color.create().copy(color))
      @colors.push(Color.create().copy(color))
      @colors.push(Color.create().copy(color))
      @colors.push(Color.create().copy(color))

    reset: () ->
      @vertices.length = 0
      @colors.length = 0

