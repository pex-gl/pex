define(["pex/core/Context", "pex/core/Texture2D"], function(Context, Texture2D) {
  function RenderTarget(width, height, options) {
    var gl = this.gl = Context.currentContext.gl;
    this.width = width;
    this.height = height;

    this.handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);

    this.colorAttachements = [];

    if (options && options.depth) {
      var depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.getError(); //reset error
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
      if (gl.getError() != gl.NO_ERROR) {
        //24 bit depth buffer might be not available, trying with 16
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      }
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
      this.depthBuffer = depthBuffer;
    }

    var texture = Texture2D.create(width, height, options);
    texture.bind();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.colorAttachements.length, texture.target, texture.handle, 0);
    this.colorAttachements.push(texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  //### bind ( )
  //Binds the frame buffer to the current WebGL context.
  //All subsequent render calls will be drawing to this buffer.
  RenderTarget.prototype.bind = function(){
  RenderTarget.prototype.bind = function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  }

  //### unbind ( )
  //Unbinds the frame buffer from the current WebGL context.
  //All subsequent render calls will be drawing to main screen.
  RenderTarget.prototype.unbind = function(){
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  RenderTarget.prototype.getColorAttachement = function(index) {
    index = index || 0;
    return this.colorAttachements[index];
  }

  return RenderTarget;
});