define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/color/Color',
  'lib/text!pex/materials/ShowDepth.glsl'
], function (Material, Context, Program, ObjectUtils, Color, ShowDepthGLSL) {
  function ShowDepth(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowDepthGLSL);
    var defaults = {
        near: 0,
        far: 10,
        nearColor: Color.create(0, 0, 0, 1),
        farColor: Color.create(1, 1, 1, 1)
      };
    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  ShowDepth.prototype = Object.create(Material.prototype);
  return ShowDepth;
});