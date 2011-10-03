define(["pex/core/Context","pex/sys/IO"], function(Context, IO) {
  function Texture2D() {

  }

  Texture2D.genNoise = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext;

    var handle = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, handle);

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

    var texture = new Texture2D();
    texture.handle = handle;
    texture.width = w;
    texture.height = h;
    texture.target = gl.TEXTURE_2D;
    return texture;
  }

  Texture2D.genNoiseRGBA = function(w, h) {
    w = w || 256;
    h = h || 256;

    var gl = Context.currentContext;

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
    return texture;
  }

  Texture2D.load = function(src) {
    var gl = Context.currentContext;

    var texture = new Texture2D();
    texture.handle = gl.createTexture();
    texture.target = gl.TEXTURE_2D;

    IO.loadImageData(gl, texture, texture.target, src, function(image) {
      if (!image) {
        //texture.dispose();
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
    });

    return texture;
  }


  return Texture2D;
})