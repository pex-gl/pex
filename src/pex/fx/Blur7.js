define([
  'pex/fx/FXStage',
  'lib/text!pex/fx/Blur7H.glsl',
  'lib/text!pex/fx/Blur7V.glsl',
  'pex/geom/Vec2'
], function (FXStage, Blur7HGLSL, Blur7VGLSL, Vec2) {
  FXStage.prototype.blur7 = function (options) {
    options = options || {};
    var outputSize = this.getOutputSize(options.width, options.height);
    var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var source = this.getSourceTexture();
    var programH = this.getShader(Blur7HGLSL);
    programH.use();
    programH.uniforms.imageSize(Vec2.create(source.width, source.height));
    rth.bindAndClear();
    source.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
    rth.unbind();
    var programV = this.getShader(Blur7VGLSL);
    programV.use();
    programV.uniforms.imageSize(Vec2.create(source.width, source.height));
    rtv.bindAndClear();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachement(0), programV);
    rtv.unbind();
    return this.asFXStage(rtv, 'blur7');
  };
});