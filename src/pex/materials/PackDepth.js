define([
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/materials/Material',
  'pex/utils/ObjectUtils',
  'lib/text!pex/materials/PackDepth.glsl'
], function (Context, Program, Material, ObjectUtils, PackDepthGLSL) {
  function PackDepthMaterial(uniforms) {
    this.gl = Context.currentContext.gl;
    this.program = new Program(PackDepthGLSL);
    var defaults = {
        near: 0.1,
        far: 100
      };
    this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }
  PackDepthMaterial.prototype = new Material();
  return PackDepthMaterial;
});