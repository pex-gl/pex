//based on work of Rayan Alexander in Embr https://github.com/notlion/embr

define([], function() {
  var kShaderPrefix         = "#ifdef GL_ES\nprecision highp float;\n#endif\n";
  var kVertexShaderPrefix   = kShaderPrefix + "#define VERT\n";
  var kFragmentShaderPrefix = kShaderPrefix + "#define FRAG\n";
  
  function makeUniformSetter(gl, type, location){
    switch(type){
      case gl.BOOL:
      case gl.INT:
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE:
        return function(value){
          gl.uniform1i(location, value);
        };
      case gl.FLOAT:
        return function(value){
          gl.uniform1f(location, value);
        };
      case gl.FLOAT_VEC2:
        return function(v){
          gl.uniform2f(location, v.x, v.y);
        };
      case gl.FLOAT_VEC3:
        return function(v){
          gl.uniform3f(location, v.x, v.y, v.z);
        };
      case gl.FLOAT_VEC4:
        return function(v){
          gl.uniform4f(location, v.x, v.y, v.z, v.w);
        };
      case gl.FLOAT_MAT4:
        return function(mat4){
          gl.uniformMatrix4fv(location, false, mat4.toFloat32Array());
        };
    }
    return function(){
      throw "Unknown uniform type: " + type;
    };
  }
  
  function Program(gl, vertSrc, fragSrc){
    this.gl = gl;
    
    fragSrc = fragSrc ? fragSrc : vertSrc;
    
    var vert = this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, kVertexShaderPrefix + vertSrc);
    gl.compileShader(vert);
    if (gl.getShaderParameter(vert, gl.COMPILE_STATUS) !== true)
        throw gl.getShaderInfoLog(vert);
        
    var frag = this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, kFragmentShaderPrefix + fragSrc);
    gl.compileShader(frag);
    if (gl.getShaderParameter(frag, gl.COMPILE_STATUS) !== true)
        throw gl.getShaderInfoLog(frag);
    
    this.handle = gl.createProgram();
    this.link();
  }
  
  Program.prototype.link = function(){
    var gl = this.gl;
    var handle = this.handle;
    
    gl.attachShader(handle, this.vertShader);
    gl.attachShader(handle, this.fragShader);
    gl.linkProgram(handle);
    
    if(gl.getProgramParameter(handle, gl.LINK_STATUS) !== true)
        throw gl.getProgramInfoLog(handle);

    this.uniforms  = {};
    this.attributes = {};

    var numUniforms = gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS);

    for(var i = 0; i < numUniforms; ++i){
      var info     = gl.getActiveUniform(handle, i);
      var location = gl.getUniformLocation(handle, info.name);
      this.uniforms[info.name] = makeUniformSetter(gl, info.type, location);
    }

    var numAttributes = gl.getProgramParameter(handle, gl.ACTIVE_ATTRIBUTES);
    for(var i = 0; i < numAttributes; ++i){
      var info     = gl.getActiveAttrib(handle, i);
      var location = gl.getAttribLocation(handle, info.name);
      this.attributes[info.name] = location;
    } 

    return this;
  };

  Program.prototype.use = function(){
    
    this.gl.useProgram(this.handle);
  };
  
  Program.prototype.dispose = function(){
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.handle);
  };
  
  return Program;
});