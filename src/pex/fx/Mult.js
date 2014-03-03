define([
  'pex/fx/FXStage',
  'lib/text!pex/fx/Mult.glsl'
], function (FXStage, MultGLSL) {
  FXStage.prototype.mult = function (source2, options) {
    options = options || {};
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();
    this.getSourceTexture().bind(0);
    this.getSourceTexture(source2).bind(1);
    var program = this.getShader(MultGLSL);
    program.use();
    program.uniforms.tex0(0);
    program.uniforms.tex1(1);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();
    return this.asFXStage(rt, 'mult');
  };
});