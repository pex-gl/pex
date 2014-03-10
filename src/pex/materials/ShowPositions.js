define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/ShowPositions.glsl'
], function (Material, Context, Program, ObjectUtils, ShowPositionsGLSL) {
  function ShowPositions(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowPositionsGLSL);
    var defaults = { pointSize: 1 };
    uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  ShowPositions.prototype = Object.create(Material.prototype);
  return ShowPositions;
});
