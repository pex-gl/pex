define(['pex/gl/Context'], function(Context) {

  function Material(program, uniforms) {
    this.gl = Context.currentContext.gl;
    this.program = program;
    this.uniforms = uniforms || {};
    this.prevUniforms = {}
  }

  Material.prototype.use = function() {
    this.program.use();
    var numTextures = 0;
    for(var name in this.uniforms) {
      if (this.program.uniforms[name]) {
        if (this.program.uniforms[name].type == this.gl.SAMPLER_2D
        ||  this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
          this.gl.activeTexture(this.gl.TEXTURE0 + numTextures);

          if (this.uniforms[name].width > 0 && this.uniforms[name].height > 0) {
            this.gl.bindTexture(this.uniforms[name].target, this.uniforms[name].handle);
            this.program.uniforms[name]( numTextures );
          }

          numTextures++;
        }
        else {
          var newValue = this.uniforms[name];
          var oldValue = this.prevUniforms[name];
          var newHash = null;
          if (oldValue != null) {
            if (newValue.hash) {
              newHash = newValue.hash()
              if (newHash == oldValue) {
                continue;
              }
            }
            else if (newValue == oldValue) {
              continue;
            }
          }
          this.program.uniforms[name]( this.uniforms[name] );
          this.prevUniforms[name] = newHash ? newHash : newValue
        }
      }
    }
  }

  return Material;
});