//Cube texture.

//## Example use
//     var envMap = TextureCube.load("image_####.jpg");
//     envMap.bind();

//## Reference
define(["pex/core/Context", "pex/sys/IO"], function(Context, IO) {

  //### TextureCube ( )
  //Does nothing, use *load()* method instead.
  function TextureCube() {
    this.handle = null;
  }

  //### bind ( unit )
  //Binds the texture to the current GL context.  
  //`unit` - texture unit in which to place the texture *{ Number/Int }* = 0
  TextureCube.prototype.bind = function(unit) {
    unit = unit ? unit : 0;    
    this.gl.activeTexture(gl.TEXTURE0 + unit);
    this.gl.bindTexture(gl.TEXTURE_CUBE,  this.handle);
  }

  //### load ( src )
  //Load texture from file (in Plask) or url (in the web browser).  
  //
  //`src` - path to file or url (e.g. *path/file_####.jpg*) *{ String }*  
  //
  //Returns the loaded texture *{ Texture2D }*  
  //  
  //*Note* the path or url must contain #### that will be replaced by 
  //id (e.g. *posx*) of the cube side*  
  //
  //*Note: In Plask the texture is ready immediately, in the web browser it's 
  //first black until the file is loaded and texture can be populated with the image data.*
  TextureCube.load = function(src) {

    var gl = Context.currentContext.gl;

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

    return texture;
  }

  //### dispose ( )
  //Frees the texture data.
  TextureCube.prototype.dispose = function() {
    if (this.handle) {
      this.gl.deleteTexture(this.handle);
      this.handle = null;
    }
  }

  return TextureCube;
})