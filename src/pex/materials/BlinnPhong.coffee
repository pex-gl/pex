define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  BlinnPhongGLSL = require('lib/text!./BlinnPhong.glsl')

  class BlinnPhong extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(BlinnPhongGLSL)

      defaults =
        wrap: 0
        pointSize : 1
        lightPos: Vec3.create(10, 20, 30)
        ambientColor: Color.create(0, 0, 0, 1)
        diffuseColor: Color.create(1, 1, 1, 1)
        specularColor: Color.create(1, 1, 1, 1)
        shininess: 32
        useBlinnPhong: true

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
