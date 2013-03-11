define(['pex/gl/Texture','pex/gl/Context','pex/sys/IO'], function(Texture, Context, IO) {

  function Texture2D() {
    console.log('Texture2D+');
    this.init(Context.currentContext.gl.TEXTURE_2D);
  }

  Texture2D.prototype = Object.create(Texture.prototype);

  Texture2D.create = function(w, h, options) {
    options = options || {};
    var gl = Context.currentContext.gl;

    Texture.call(this, gl.TEXTURE_2D);

    var texture = new Texture2D();
    texture.bind();

    var isWebGL = gl.getExtension ? true : false;
    var internalFloatFormat = isWebGL ? gl.RGBA : 0x8814 /*RGBA32F_ARB*/;

    if (options.bpp == 32) gl.texImage2D(gl.TEXTURE_2D, 0, internalFloatFormat, w, h, 0, gl.RGBA, gl.FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    texture.width = w;
    texture.height = h;
    texture.target = gl.TEXTURE_2D;
    texture.flipped = false;

    return texture;
  }

  Texture2D.prototype.bind = function(unit) {
    unit = unit ? unit : 0;

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D,  this.handle);
  }

  Texture2D.genNoise = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext.gl;

    var texture = new Texture2D();
    texture.bind();

    var b = new ArrayBuffer(w*h);
    var pixels = new Uint8Array(b);
    for(var y=0; y<h; y++) {
      for(var x=0; x<w; x++) {
        pixels[y*w + x] = Math.floor(Math.random()*255);
      }
    }
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    texture.width = w;
    texture.height = h;
    return texture;
  }

  Texture2D.genNoiseRGBA = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext.gl;

    var handle = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, handle);

    var b = new ArrayBuffer(w*h*4);
    var pixels = new Uint8Array(b);
    for(var y=0; y<h; y++) {
      for(var x=0; x<w; x++) {
        pixels[(y*w + x)*4+0] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+1] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+2] = Math.floor(255 * Math.random());
        pixels[(y*w + x)*4+3] = Math.floor(255 * Math.random());
      }
    }
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    var texture = new Texture2D();
    texture.handle = handle;
    texture.width = w;
    texture.height = h;
    texture.target = gl.TEXTURE_2D;
    texture.gl = gl;

    return texture;
  }

  Texture2D.load = function(src, callback) {
    var gl = Context.currentContext.gl;

    var texture = new Texture2D();
    texture.handle = gl.createTexture();
    texture.target = gl.TEXTURE_2D;
    texture.gl = gl;

    IO.loadImageData(gl, texture, texture.target, src, function(image) {
      if (!image) {
        texture.dispose();
        var noise = Texture2D.getNoise();
        texture.handle = noise.handle;
        texture.width = noise.width;
        texture.height = noise.height;
      }

      gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(texture.target, null);
      texture.width = image.width;
      texture.height = image.height;

      if (callback) callback(texture);
    });

    return texture;
  }

  Texture2D.prototype.dispose = function() {
    if (this.handle) {
      this.gl.deleteTexture(this.handle);
      this.handle = null;
    }
  }

  return Texture2D;
})