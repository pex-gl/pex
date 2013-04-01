define(['pex/fx/FXStage', 'lib/text!pex/fx/SSAO.glsl', 'pex/geom/Vec2'], function(FXStage, SSAOGLSL, Vec2) {
  FXStage.prototype.ssao = function(options) {
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);

    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    var depthSource = this.getSourceTexture(options.depthSource);

    var program = this.getShader(SSAOGLSL);
    program.use();
    program.uniforms.textureSize(Vec2.fromValues(depthSource.width, depthSource.height));
    program.uniforms.depthTex(0);
    program.uniforms.near(options.near || 0.1);
    program.uniforms.far(options.far || 100);
    rt.bind();
    depthSource.bind();
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'ssao');
  };
});