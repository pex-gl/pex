//Base class encapsulating shader and GL state used to describe a rendering style.

//## Example use
//     var envMappingMaterial = new Material(
//       Program.load('data/envShader.glsl'),
//       {
//         texture : Texture2D.load('data/envmap_blur2.jpg'),
//         lightPos : new Vec3(10, 10, 10)
//       }
//     );
//
//     var sphere = new Mesh(new Sphere(3), envMappingMaterial);

//## Reference
define(["pex/core/Context"], function(Context) {

  //### Material ( program, uniforms )
  //`program` - shader program *{ Program }*  
  //`uniforms` - initial values for the shader program uniforms  *{ Object }*  
  //The format for uniforms is  *{ uniform1Name : uniform1Value, ... }*
  function Material(program, uniforms ) {
    this.gl = Core.Context.currentContext.gl;
    this.program = program;
    this.uniforms = uniforms || {};
  }

  //### use ( )
  //Binds the program, sets all the uniforms and binds all the textures attached to the program's sampler uniforms.
  Material.prototype.use = function() {
    this.program.use();
    var numTextures = 0;
    for(var name in this.uniforms) {
      if (this.program.uniforms[name]) {
        if (this.program.uniforms[name].type == this.gl.SAMPLER_2D 
        ||  this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
          this.gl.activeTexture(this.gl.TEXTURE0 + numTextures++);
          this.gl.bindTexture(this.uniforms[name].target,  this.uniforms[name].handle);
        }
        else {
          this.program.uniforms[name]( this.uniforms[name] );
        }
      }
    }
  }

  return Material;
});