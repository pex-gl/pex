define(['pex/fx/FXStage', 'lib/text!pex/fx/FXAA.glsl'], function(FXStage, FXAAGLSL) {
  FXStage.prototype.fxaa = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();

    var source = this.getSourceTexture();
    source.bind();
    var program = this.getShader(FXAAGLSL);
    program.use();
    program.uniforms.rtWidth(source.width);
    program.uniforms.rtHeight(source.height);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'fxaa');
  }
})