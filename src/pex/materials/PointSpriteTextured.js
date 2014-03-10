define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec4',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/PointSpriteTextured.glsl'
], function (Material, Context, Program, Vec4, ObjectUtils, PointSpriteTexturedGLSL) {
  function PointSpriteTextured(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(PointSpriteTexturedGLSL);
    var defaults = {
        pointSize: 1,
        alpha: 1
      };
    uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  PointSpriteTextured.prototype = Object.create(Material.prototype);
  return PointSpriteTextured;
});
