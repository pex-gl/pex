define(["pex/gl/Context", "pex/sys/IO"], function(Context, IO) {
  var kShaderPrefix         = "#ifdef GL_ES\nprecision highp float;\n#endif\n";
  var kVertexShaderPrefix   = kShaderPrefix + "#define VERT\n";
  var kFragmentShaderPrefix = kShaderPrefix + "#define FRAG\n";

  function Program(vertSrc, fragSrc) {
    this.gl = Context.currentContext.gl;

    this.handle = this.gl.createProgram();
    this.uniforms  = {};
    this.attributes = {};
    this.addSources(vertSrc, fragSrc);
    this.ready = false;
    if (this.vertShader && this.fragShader) this.link();
  }

  Program.prototype.addSources = function(vertSrc, fragSrc) {
    vertSrc = vertSrc ? vertSrc : null;
    fragSrc = fragSrc ? fragSrc : vertSrc;

    if (vertSrc) this.addVertexSource(vertSrc);
    if (fragSrc) this.addFragmentSource(fragSrc);
  };

  Program.prototype.addVertexSource = function(vertSrc) {
    var gl = this.gl;
    var vert = this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, kVertexShaderPrefix + vertSrc);
    gl.compileShader(vert);
    if (gl.getShaderParameter(vert, gl.COMPILE_STATUS) !== true) {
      console.log(vertSrc);
      throw gl.getShaderInfoLog(vert);
    }
  };

  Program.prototype.addFragmentSource = function(fragSrc) {
    var gl = this.gl;
    var frag = this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, kFragmentShaderPrefix + fragSrc);
    gl.compileShader(frag);
    if (gl.getShaderParameter(frag, gl.COMPILE_STATUS) !== true) {
      console.log(fragSrc);
      throw gl.getShaderInfoLog(frag);
    }
  };

  Program.prototype.link = function(){
    var gl = this.gl;
    var handle = this.handle;

    gl.attachShader(handle, this.vertShader);
    gl.attachShader(handle, this.fragShader);
    gl.linkProgram(handle);

    if (gl.getProgramParameter(handle, gl.LINK_STATUS) !== true)
        throw gl.getProgramInfoLog(handle);

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

    this.ready = true;
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

  Program.load = function(url, callback) {
    var program = new Program();
    IO.loadTextFile(url, function(source) {
      console.log("Program.Compiling " + url);
      program.addSources(source);
      program.link();
      if (callback) callback();
    });
    return program;
  }

  function makeUniformSetter(gl, type, location){
    var setterFun = null;
    switch(type){
      case gl.BOOL:
      case gl.INT:
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE:
        setterFun = function(value){
          if (isNaN(value)) {
            gl.uniform1i(location, value.handle);
          }
          else {
            gl.uniform1i(location, value);
          }
        };
        break;
      case gl.FLOAT:
        setterFun = function(value){
          gl.uniform1f(location, value);
        };
        break;
      case gl.FLOAT_VEC2:
        setterFun = function(v){
          gl.uniform2fv(location, v);
        };
        break;
      case gl.FLOAT_VEC3:
        setterFun = function(v) {
          gl.uniform3fv(location, v);
        };
        break;
      case gl.FLOAT_VEC4:
        setterFun = function(v){
          gl.uniform4fv(location, v);
        };
        break;
      case gl.FLOAT_MAT4:
        setterFun = function(mv) {
          gl.uniformMatrix4fv(location, false, mv);
        };
        break;
    }

    if (setterFun) {
      setterFun.type = type;
      return setterFun;
    }
    return function(){
      throw "Unknown uniform type: " + type;
    };
  }

  return Program;
});