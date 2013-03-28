define(['pex/fx/FXGraph', 'pex/gl/ScreenImage', 'pex/geom/Vec2'], function(FXGraph, ScreenImage, Vec2) {
  FXGraph.prototype.blit = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var x = options.x || 0;
    var y = options.y || 0;

    this.drawFullScreenQuadAt(x, y, outputSize.width, outputSize.height, this.getSourceTexture());

    return this;
  }
})