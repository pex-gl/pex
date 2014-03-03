define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/Test.glsl'
  ], function(Material, Context, Program, Color, ObjectUtils, TestGLSL) {

  function Test() {
    this.gl = Context.currentContext.gl;
    var program = new Program(TestGLSL);

    var uniforms = {};

    Material.call(this, program, uniforms);
  }

  Test.prototype = Object.create(Material.prototype);

  return Test;
});
