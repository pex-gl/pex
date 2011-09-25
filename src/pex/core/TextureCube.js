define(["pex/io/IO"], function(IO) {
  function TextureCube() {

  }

  TextureCube.load = function(src) {

    var gl = Context.currentContext;

    var texture = new TextureCube();
    texture.handle = gl.createTexture();
    texture.target = gl.TEXTURE_CUBE_MAP;

    var cubeMapTargets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'posx',
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'negx',
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'posy',
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'negy',
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'posz',
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'negz'
    ];

    for (var i=0; i<cubeMapTargets.length; i += 2) {
      IO.loadImageData(gl, texture, cubeMapTargets[i], src.replace("####", cubeMapTargets[i+1]), function(image) {
        texture.width = image.width;
        texture.height = image.height;
      });
    }

    gl.bindTexture(texture.target, texture.handle);
    gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.bindTexture(texture.target, null);

    return texture;
  }

  return TextureCube;
})