define(['pex/fx/FXStage'], function(FXStage) {
  FXStage.prototype.render = function(options) {
    var gl = this.gl;
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var oldViewport = gl.getParameter(gl.VIEWPORT);
    gl.viewport(0, 0, outputSize.width, outputSize.height);

    rt.bindAndClear();
    if (options.drawFunc) {
      options.drawFunc();
    }
    rt.unbind();
    gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);

    return this.asFXStage(rt, 'render');
  }
})