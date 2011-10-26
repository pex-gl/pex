define(["pex/core/Context"], function(Context) {
  function Material(program, uniforms, options) {
    this.gl = Context.currentContext;
    this.program = program;
    this.uniforms = uniforms || {};
    this.options = options || {};
  }

  Material.prototype.use = function() {
    this.program.use();
    var numTextures = 0;
    for(var name in this.uniforms) {
      if (this.program.uniforms[name]) {
        if (this.program.uniforms[name].type == this.gl.SAMPLER_2D || this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
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