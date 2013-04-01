define(['pex/fx/FXStage', 'lib/text!pex/fx/Add.glsl'], function(FXStage, AddGLSL) {
  FXStage.prototype.add = function(source2, options) {
    options = options || {};
    scale = (options.scale !== undefined) ? options.scale : 1;

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);

    rt.bind();

    this.getSourceTexture().bind(0);
    this.getSourceTexture(source2).bind(1);

    var program = this.getShader(AddGLSL);
    program.use();
    program.uniforms.tex0( 0 );
    program.uniforms.tex1( 1 );
    program.uniforms.scale( scale );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);

    rt.unbind();

    return this.asFXStage(rt, 'add');
  }
})