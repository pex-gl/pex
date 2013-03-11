define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'text!pex/materials/ShowTexCoords.glsl'
  ], function(Material, Context, Program, ObjectUtils, ShowTexCoordGLSL) {

  function ShowTexCoords(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowTexCoordGLSL);

    var defaults = {
      pointSize : 1
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowTexCoords.prototype = Object.create(Material.prototype);

  return ShowTexCoords;
});