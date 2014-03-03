define([
  'pex/fx/FXStage',
  'lib/text!pex/fx/Blur3H.glsl',
  'lib/text!pex/fx/Blur3V.glsl',
  'pex/geom/Vec2'
], function (FXStage, Blur3HGLSL, Blur3VGLSL, Vec2) {
  FXStage.prototype.blur3 = function (options) {
    options = options || {};
    var outputSize = this.getOutputSize(options.width, options.height);
    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();
    var programH = this.getShader(Blur3HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();
    var programV = this.getShader(Blur3VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();
    return this.asFXStage(rtv, 'blur3');
  };
});