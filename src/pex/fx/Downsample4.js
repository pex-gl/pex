define(['pex/fx/FXGraph', 'lib/text!pex/fx/Downsample4.glsl', 'pex/geom/Vec2'], function(FXGraph, Downsample4GLSL, Vec2) {
  FXGraph.prototype.downsample4 = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height, true);
    outputSize.width /= 4;
    outputSize.height /= 4;

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.name = 'downsample4';
    var source = this.getSourceTexture();

    var program = this.getShader(Downsample4GLSL);
    program.use();
    program.uniforms.textureSize(Vec2.fromValues(source.width, source.height));
    rt.bindAndClear();
    source.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, program);
    rt.unbind();

    this.stack.push(rt);

    return this;

  }
})