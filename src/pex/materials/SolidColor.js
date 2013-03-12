define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec4',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/SolidColor.glsl'
  ], function(Material, Context, Program, Vec4, ObjectUtils, SolidColorGLSL) {

  function SolidColor(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(SolidColorGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1),
     pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  SolidColor.prototype = Object.create(Material.prototype);

  return SolidColor;
});