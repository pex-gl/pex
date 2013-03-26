define(['pex/fx/FXGraph'], function(FXGraph) {
  FXGraph.prototype.blit = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    this.getSourceTexture().bind();

    var x = options.x || 0;
    var y = options.y || 0;

    this.drawFullScreenQuadAt(x, y, outputSize.width, outputSize.height );

    return this;
  }
})