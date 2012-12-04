//GLSL Shader Program wrapper based on implementation in [Embr](https://github.com/notlion/embr).

//## Example use
//     //basic.glsl
//     #ifdef VERT
//     uniform mat4 projectionMatrix;
//     uniform mat4 modelViewMatrix;
//     attribute vec3 position;
//     void main() {
//       vec4 pos = vec4(position, 1.0);
//       gl_Position = projectionMatrix * modelViewMatrix * pos;
//     }
//     #endif
//     #ifdef FRAG
//     void main() {
//       gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//     }
//     #endif
//
//     //test.js
//     var basicMaterial = new Material(Program.load('basic.glsl'));

//## Reference
define(["pex/core/Context", "pex/sys/IO", "pex/util/GLUtils"], function(Context, IO, GLUtils) {
  var kShaderPrefix         = "#ifdef GL_ES\nprecision highp float;\n#endif\n";
  var kVertexShaderPrefix   = kShaderPrefix + "#define VERT\n";
  var kFragmentShaderPrefix = kShaderPrefix + "#define FRAG\n";

  //### Program ( vertSrc, fragSrc )
  //`vertScr` - optional vertex shader source *{ String }*
  //`fragSrc` - optional fragment shader source *{ String }*
  function Program(vertSrc, fragSrc) {
    this.gl = Context.currentContext.gl;

    this.handle = this.gl.createProgram();
    this.uniforms  = {};
    this.attributes = {};
    this.addSources(vertSrc, fragSrc);
    this.ready = false;
    if (this.vertShader && this.fragShader) this.link();
  }

  //### addSources ( vertScr, fragScr )
  //Adds vertex shader and fragment shader source codes at once and compiles them.
  //`vertScr` - vertex shader source *{ String }*
  //`fragSrc` - fragment shader source *{ String }*
  Program.prototype.addSources = function(vertSrc, fragSrc) {
    vertSrc = vertSrc ? vertSrc : null;
    fragSrc = fragSrc ? fragSrc : vertSrc;

    if (vertSrc) this.addVertexSource(vertSrc);
    if (fragSrc) this.addFragmentSource(fragSrc);
  };

  //### addVertexSource ( vertScr )
  //Adds vertex shader source code and compiles it.
  //`vertScr` - vertex shader source *{ String }*
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

  //### addSources ( vertScr, fragScr )
  //Adds fragment shader source code and compiles it.
  //`fragSrc` - fragment shader source *{ String }*
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

  //### link ( )
  //Links previousily added and compiled sources to the program.
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

  //### use ( )
  //Binds the program to the current GL context.
  Program.prototype.use = function(){
    this.gl.useProgram(this.handle);
  };

  //### dispose ( )
  //Frees all the GPU resources used by that program.
  Program.prototype.dispose = function(){
    this.gl.deleteShader(this.vertShader);
    this.gl.deleteShader(this.fragShader);
    this.gl.deleteProgram(this.handle);
  };

  //### load ( )
  //Load the GLSL shader source from a file.
  //`url` - url of the file *{ String }*
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

  //### makeUniformSetter
  //Builds setter function for given uniform type.
  //`gl` - WebGL context *{ GL }*
  //`type` - uniform type *{ Number/Int }*
  //`location` - uniform location *{ Number/Int }*
  //Returns the setter *{ Function }*
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
          gl.uniform2f(location, v.x, v.y);
        };
        break;
      case gl.FLOAT_VEC3:
        setterFun = function(v) {
          if (!isNaN(v.length)) {
            gl.uniform3fv(location, v);
          }
          else {
            gl.uniform3f(location, v.x, v.y, v.z);
          }
        };
        break;
      case gl.FLOAT_VEC4:
        setterFun = function(v){
          gl.uniform4f(location, v.x, v.y, v.z, v.w);
        };
        break;
      case gl.FLOAT_MAT4:
        setterFun = (function() {
          var mv = new Float32Array(16);
          return function(mat4){
            mv[0] = mat4.a11;
            mv[1] = mat4.a21;
            mv[2] = mat4.a31;
            mv[3] = mat4.a41;
            mv[4] = mat4.a12;
            mv[5] = mat4.a22;
            mv[6] = mat4.a32;
            mv[7] = mat4.a42;
            mv[8] = mat4.a13;
            mv[9] = mat4.a23;
            mv[10] = mat4.a33;
            mv[11] = mat4.a43;
            mv[12] = mat4.a14;
            mv[13] = mat4.a24;
            mv[14] = mat4.a34;
            mv[15] = mat4.a44;
            gl.uniformMatrix4fv(location, false, mv);
          };
        })();
        break;
      default:
        setterFun = function(value){
          if (isNaN(value)) {
            gl.uniform1i(location, value.handle);
          }
          else {
            gl.uniform1i(location, value);
          }
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