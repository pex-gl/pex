define([
  'pex/fx/FXStage',
  'lib/text!pex/fx/Blur5H.glsl',
  'lib/text!pex/fx/Blur5V.glsl',
  'pex/geom/Vec2'
], function (FXStage, Blur5HGLSL, Blur5VGLSL, Vec2) {
  FXStage.prototype.blur5 = function (options) {
    options = options || {};
    var outputSize = this.getOutputSize(options.width, options.height);
    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();
    var programH = this.getShader(Blur5HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();
    var programV = this.getShader(Blur5VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();
    return this.asFXStage(rtv, 'blur5');
  };
});