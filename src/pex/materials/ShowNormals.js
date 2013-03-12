define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowNormals.glsl'
  ], function(Material, Context, Program, ObjectUtils, ShowNormalGLSL) {

  function ShowNormals(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowNormalGLSL);

    var defaults = {
      pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowNormals.prototype = Object.create(Material.prototype);

  return ShowNormals;
});