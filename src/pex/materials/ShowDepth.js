define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/geom/Vec4',
  'lib/text!pex/materials/ShowDepth.glsl'
  ], function(Material, Context, Program, ObjectUtils, Vec4, ShowDepthGLSL) {

  function ShowDepth(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ShowDepthGLSL);

    var defaults = {
      near: 0,
      far: 10,
      nearColor: Vec4.fromValues(0, 0, 0, 1),
      farColor: Vec4.fromValues(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowDepth.prototype = Object.create(Material.prototype);

  return ShowDepth;
});