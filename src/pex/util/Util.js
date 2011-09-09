define(["pex/util/Time"], function(Time) {  
  var gl_enums = null;
  
  function Util() { 
    
  };  
  
  Util.Time = Time;

  Util.checkGLErrors = function(gl, msg) {
    msg = msg || "";      
    var err = gl.getError();
    if (err !== gl.NO_ERROR){
      if (gl_enums === null){
        gl_enums = {};
        for(var name in gl){
          if(typeof gl[name] == 'number')
            gl_enums[gl[name]] = name;
        }
      }
      throw msg + " (" + gl_enums[err] + ")";
    }
  }
  
  return Util;
});