define([
  'pex/gl/Context',
  'pex/materials/Material',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'text!pex/materials/Textured.glsl'
  ],
  function(Context, Material, Program, ObjectUtils, TexturedGLSL) {

  function Textured(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(TexturedGLSL);
    var uniforms = ObjectUtils.mergeObjects({}, uniforms);

    Material.call(this, program, uniforms);
  }

  Textured.prototype = Object.create(Material.prototype);

  return Textured;
});