define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/SolidColor.glsl'
], function (Material, Context, Program, Color, ObjectUtils, SolidColorGLSL) {
  function SolidColor(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(SolidColorGLSL);
    var defaults = {
        color: Color.create(1, 1, 1, 1),
        pointSize: 1,
        premultiplied: 0
      };
    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  SolidColor.prototype = Object.create(Material.prototype);
  return SolidColor;
});