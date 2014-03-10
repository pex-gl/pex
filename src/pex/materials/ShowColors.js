define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowColors.glsl'
], function (Material, Context, Program, ObjectUtils, ShowColorsGLSL) {
  function ShowColors(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowColorsGLSL);
    var defaults = { pointSize: 1 };
    uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  ShowColors.prototype = Object.create(Material.prototype);
  return ShowColors;
});
