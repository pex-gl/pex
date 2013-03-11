define(['pex/gl/Context'], function(Context) {

  function Material(program, uniforms) {
    this.gl = Context.currentContext.gl;
    this.program = program;
    this.uniforms = uniforms || {};
  }

  Material.prototype.use = function() {
    this.program.use();
    var numTextures = 0;
    for(var name in this.uniforms) {
      if (this.program.uniforms[name]) {
        if (this.program.uniforms[name].type == this.gl.SAMPLER_2D
        ||  this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
          this.gl.activeTexture(this.gl.TEXTURE0 + numTextures);
          this.gl.bindTexture(this.uniforms[name].target,  this.uniforms[name].handle);
          this.program.uniforms[name]( numTextures );

          numTextures++;
        }
        else {
          this.program.uniforms[name]( this.uniforms[name] );
        }
      }
    }
  }

  return Material;
});