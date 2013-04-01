define(['pex/fx/FXStage', 'pex/gl/ScreenImage', 'pex/geom/Vec2'], function(FXStage, ScreenImage, Vec2) {
  FXStage.prototype.blit = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var x = options.x || 0;
    var y = options.y || 0;

    this.drawFullScreenQuadAt(x, y, outputSize.width, outputSize.height, this.getSourceTexture());

    return this;
  }
})