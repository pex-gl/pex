define(['pex/fx/FXStage'], function(FXStage) {
  FXStage.prototype.image = function(path, options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    rt.bind();

    var image = this.getImage(path);

    image.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height);

    rt.unbind();

    return this.asFXStage(rt, 'image');
  };
})