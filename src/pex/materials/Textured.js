define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec4',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/Textured.glsl'
  ], function(Material, Context, Program, Vec4, ObjectUtils, TexturedGLSL) {

  function Textured(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(TexturedGLSL);

    var defaults = {
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  Textured.prototype = Object.create(Material.prototype);

  return Textured;
});