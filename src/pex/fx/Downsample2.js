define(['pex/fx/FXStage', 'lib/text!pex/fx/Downsample2.glsl', 'pex/geom/Vec2'], function(FXStage, Downsample2GLSL, Vec2) {
  FXStage.prototype.downsample2 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    outputSize.width /= 2;
    outputSize.height /= 2;

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();

    var program = this.getShader(Downsample2GLSL);
    program.use();
    program.uniforms.imageSize(Vec2.fromValues(source.width, source.height));
    rt.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, program);
    rt.unbind();

    return this.asFXStage(rt, 'downsample2');
  }
})