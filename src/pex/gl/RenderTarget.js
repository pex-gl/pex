define(['pex/gl/Context', 'pex/gl/Texture2D'], function(Context, Texture2D) {
  function RenderTarget(width, height, options) {
    var gl = this.gl = Context.currentContext.gl;
    this.width = width;
    this.height = height;
    this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    this.handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);

    this.colorAttachements = [];

    if (options && options.depth) {
      var oldRenderBufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING);
      var depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.getError(); //reset error

      if (gl.DEPTH_COMPONENT24) {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
      }

      if (gl.getError() || !gl.DEPTH_COMPONENT24) {
        //24 bit depth buffer might be not available, trying with 16
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      }
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
      this.depthBuffer = depthBuffer;
      gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderBufferBinding);
    }

    var texture = Texture2D.create(width, height, options);
    texture.bind();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.colorAttachements.length, texture.target, texture.handle, 0);
    this.colorAttachements.push(texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
    this.oldBinding = null;
  }

  RenderTarget.prototype.bind = function() {
    var gl = this.gl;
    this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  }

  RenderTarget.prototype.bindAndClear = function(){
    var gl = this.gl;

    this.bind();

    gl.clearColor(0, 0, 0, 1);

    if (this.depthBuffer)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    else
      gl.clear(gl.COLOR_BUFFER_BIT);
  }

  RenderTarget.prototype.unbind = function(){
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
    this.oldBinding = null;
  }

  RenderTarget.prototype.getColorAttachement = function(index) {
    index = index || 0;
    return this.colorAttachements[index];
  }

  return RenderTarget;
});