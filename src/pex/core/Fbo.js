//Frame Buffer Object implementation used for off-screen rendering.
//Based on implementation in [Embr](https://github.com/notlion/embr)

//##Example use
//     var fbo = new Fbo(1280, 720);
//
//     fbo.bind();
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//     mesh.draw(this.camera);
//     fbo.unbind();
//
//     fbo.bindTexture(0, 0);
//     //render something using the texture
//     fbo.unbindTexture(0);

//##Reference
define(["pex/core/Context"], function(Context) {
  //### Fbo ( width, height, formats )
  //`width` - width of the framebuffer *{ Number/Int }*  
  //`height` - height of the framebuffer *{ Number/Int }*  
  //`formats` - buffer format descriptions  *{ Array of Objects }*
  //
  //Formats defaults to one RGBA texture and 16 bit depth buffer render target. 
  //The width and height of the framebuffer is used as default size of 
  //textures and attachements.
  //
  //**Format description parameters for textures:**  
  //`target` - *{ Number/Int }* must be *TEXTURE_2D*   
  //`format` - texture format *{ Number/Int }* = *RGBA*  
  //`filter_min` - texture filtering mode when scaling down  
  // *{ Number/Int }* = *NEAREST*  
  //`filter_mag` - texture filtering mode when scaling up  
  //*{ Number/Int }* = *NEAREST*  
  //`wrap_s` - horizontal texture coordinates wrapping mode  
  //*{ Number/Int }* = *CLAMP_TO_EDGE*  
  //`wrap_t` - vertical texture coordinates wrapping mode  
  //*{ Number/Int }* = *CLAMP_TO_EDGE*  
  //
  //**Format description parameters for render buffers:**  
  //`target` - *{ Number/Int }* must be *RENDERBUFFER*   
  //`attach` - attachement point  
  //*{ Number/Int }* e.g. *DEPTH_ATTACHMENT*  
  //`formati` - internal render buffer format  
  //*{ Number/Int }* e.g. *DEPTH_COMPONENT16*  
  //
  function Fbo(width, height, formats) {
    this.gl = Context.currentContext.gl;
    this.width = width;
    this.height = height;
    this.buildBuffers(formats);
  }

  //### buildBuffers ( formats )
  //Builds all attched textures and render buffers.  
  //Called automaticaly from the FBO constructor.  
  //`formats` - buffer format descriptions *{ Array of Objects }*
  Fbo.prototype.buildBuffers = function(formats) {
    var gl = this.gl;

    if (!formats) {
      formats = [
        { target: gl.TEXTURE_2D, format: gl.RGBA, filter_mag: gl.LINEAR, filter_min: gl.LINEAR },
        { target: gl.RENDERBUFFER, attach: gl.DEPTH_ATTACHMENT, formati: gl.DEPTH_COMPONENT24 }
      ]
    }
    
    this.tex_attachments = [];
    this.render_attachments = [];

    this.handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);

    for(var i = 0, n = formats.length, cai = 0; i < n; i++){
        
        var fmt = formats[i]
        ,   target  = fmt.target  || gl.TEXTURE_2D
        ,   formati = fmt.formati || gl.RGBA32F || gl.RGBA
        ,   attach  = fmt.attach  || gl.COLOR_ATTACHMENT0 + cai++;

        /* Renderbuffer Attachment (Depth, etc) */
        if (target == gl.RENDERBUFFER){
            var rb_handle = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, rb_handle);
            gl.renderbufferStorage(target, formati, this.width, this.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attach, target, rb_handle);

            this.render_attachments.push({ handle: rb_handle });
        }
        /* Texture Attachment */
        else {
            var format     = fmt.format     || gl.RGBA
            ,   type       = fmt.type       || gl.FLOAT
            ,   filter_min = fmt.filter_min || gl.NEAREST
            ,   filter_mag = fmt.filter_mag || gl.NEAREST
            ,   wrap_s     = fmt.wrap_s     || gl.CLAMP_TO_EDGE
            ,   wrap_t     = fmt.wrap_t     || gl.CLAMP_TO_EDGE

            var tex_handle = gl.createTexture();
            gl.bindTexture(target, tex_handle);
            gl.texImage2D(target, 0, formati, this.width, this.height, 0, format, type, null);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, filter_min);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, filter_mag);
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap_s);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap_t);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, target, tex_handle, 0);

            this.tex_attachments.push({ handle: tex_handle,
                                        target: target,
                                        unit:   gl.TEXTURE0,
                                        width: this.width,
                                        height: this.height
                                       });
        }
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
        throw "Incomplete frame buffer object.";
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  //### bind ( )
  //Binds the frame buffer to the current WebGL context. 
  //All subsequent render calls will be drawing to this buffer.
  Fbo.prototype.bind = function(){
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  }

  //### unbind ( )
  //Unbinds the frame buffer from the current WebGL context. 
  //All subsequent render calls will be drawing to main screen.
  Fbo.prototype.unbind = function(){
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  //### bindTexture ( i, unit )
  //Binds one of the attached textures to given texture unit.
  //
  //`i` - texture attachement index *{ Number/Int }*  
  //`unit` - texture unit to bind to *{ Number/Int }* = 0
  Fbo.prototype.bindTexture = function(i, unit) {
      var gl  = this.gl
      ,   att = this.tex_attachments[i];
      unit = unit || 0;
      if (unit !== undefined)
          att.unit = gl.TEXTURE0 + unit;
      gl.activeTexture(att.unit);
      gl.bindTexture(att.target, att.handle);
  }

  //### unbindTexture ( i )
  //Unbinds given attached texture.
  //
  //`i` - texture attachement index *{ Number/Int }*
  Fbo.prototype.unbindTexture = function(i){
      var gl  = this.gl;
      var att = this.tex_attachments[i];
      gl.activeTexture(att.unit);
      gl.bindTexture(att.target, null);
  }
  
  return Fbo;
})