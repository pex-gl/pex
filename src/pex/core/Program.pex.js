Pex.Shader = function(vertSrc, fragSrc) {    
  this.uniforms = {};
  this.attribs = {};  
  this.program = PreGL.WebGL.createProgramFromShaderSources(gl, vertSrc, fragSrc);    
  this.scanVariables(vertSrc);
  this.scanVariables(fragSrc);  
} 

Pex.Shader.prototype.bind = function() {    
  gl.useProgram(this.program);
}

Pex.Shader.prototype.unbind = function() {  
  gl.useProgram(null);  
  gl.activeTexture(gl.TEXTURE0); 
}       

Pex.Shader.prototype.scanVariables = function(src) {
  //';' would be better than '\n' in case shader source was compressed
  //but doesn't work if there are comments
  //TODO(marcin) switch to reg ex
  var lines = src.split("\n");                                             
  for(var i in lines) {
    var line = lines[i];    
    line = line.replace(/^\s+/g,"");    
    if (line.indexOf("uniform") === 0) {
      var t = line.split(" "); //TODO(marcin) switch to reg ex
      var type = t[1];
      var name = ""+t[2].replace(";", ""); 
      //check for uniform array
      if (name.indexOf("[") > 0) {                      
        name = name.substring(0, name.indexOf("["));        
      }
      var setterFunc;
      switch(type) {
        case "mat4": setterFunc = gl.uniformMatrix4fv; break;
        case "vec4": setterFunc = gl.uniform4fv; break;
        case "vec3": setterFunc = gl.uniform3fv; break;
        case "vec2": setterFunc = gl.uniform2fv; break;        
        case "float": setterFunc = gl.uniform1f; break;
        case "sampler2D": setterFunc = gl.uniform1i; break;
        case "sampler3D": setterFunc = gl.uniform1i; break;
        case "samplerCube": setterFunc = gl.uniform1i; break;                
        default: Pex.log("Unknown uniform type : \"" + line + "\"");        
      }              
      this.uniforms[name] = {
        type: type,           
        location: gl.getUniformLocation(this.program, name),
        setterFunc: setterFunc
      }    
    } 
    if (line.indexOf("attribute") === 0) {
      var t = line.split(" "); //TODO(marcin) switch to reg ex
      var type = t[1];
      var name = t[2].replace(";", "");;      
      this.attribs[name] = {
        type: type,
        location: gl.getAttribLocation(this.program, name)
      }
    }
  }
}  

Pex.Shader.prototype.set = function(name, value, param) { 
  if (!name) {
    throw "Empty name";
    return;
  }
  var uniform = this.uniforms[name];
  if (uniform) {           
    if (uniform.setterFunc == gl.uniformMatrix4fv) {   
      uniform.setterFunc.call(gl, uniform.location, false, value.toFloat32Array())
    } 
    else {
      uniform.setterFunc.call(gl, uniform.location, value);
    }   
    if (uniform.type == "sampler2D" && param) {
      gl.activeTexture(gl.TEXTURE0 + value); 
      gl.bindTexture(gl.TEXTURE_2D, param);    
    } 
  } 
  else {                     
    Pex.log("Unknown uniform name : " + name);
  }           
}       

Pex.Shader.prototype.getAttribute = function(name){ 
  return this.attribs[name];
}