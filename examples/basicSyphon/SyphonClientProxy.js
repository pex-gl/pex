define(["pex/core/Context", "pex/core/Texture", "ScreenImage"], function(Context, Texture, ScreenImage) {
  var GL_TEXTURE_RECTANGLE = 0x84F5;

  function SyphonClientProxy(window, serverName) {
    this.gl = Context.currentContext.gl;
    this.client = null;
    this.serverName = serverName;
    this.texture = new Texture(GL_TEXTURE_RECTANGLE);
    this.texture.width = 0;
    this.texture.height = 0;
		this.image = new ScreenImage(window.width, window.height, 0, 0, 480, 340, this.texture);
    this.updateWithoutFrames = 0;
  }

  SyphonClientProxy.prototype.update = function() {
    if (!this.client) {
      try {
        this.client = this.gl.createSyphonClient(this.serverName);
        console.log('SyphonClientProxy connected to "' + this.serverName + '"');
      }
      catch(e) {
        console.log("Failed to connect..");
      }
    }
    else {
      if (!this.client.isValid()) {
        this.client = null;
        this.texture.width = 0;
        this.texture.height = 0;
        console.log('SyphonClientProxy client invalid disconneting');
        return;
      }

      console.log("this.client.hasNewFrame()", this.client.hasNewFrame());
      if (this.client.hasNewFrame()) {
        var gl = this.gl;
        var texture = this.texture;

		 		var frameTexture = this.client.newFrameImage();
				texture.handle = frameTexture.name;
        texture.width = frameTexture.width;
        texture.height = frameTexture.height;
        gl.bindTexture(  GL_TEXTURE_RECTANGLE, texture.handle);
        gl.texParameteri(GL_TEXTURE_RECTANGLE, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(GL_TEXTURE_RECTANGLE, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(GL_TEXTURE_RECTANGLE, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(GL_TEXTURE_RECTANGLE, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      else {
        this.updateWithoutFrames++;
        if (this.updateWithoutFrames > 60) {
          this.updateWithoutFrames = 0;
          this.client = null;
        }
      }
    }
  }

  SyphonClientProxy.prototype.draw = function() {
    this.image.draw();
  }


  return  SyphonClientProxy;
})