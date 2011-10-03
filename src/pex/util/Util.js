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

  var startOfMeasuredTime = 0;
  Util.startMeasuringTime = function() {
    startOfMeasuredTime = (new Date()).getTime();
  }

  Util.stopMeasuringTime = function(msg) {
    var now = (new Date()).getTime();

    var seconds = (now - startOfMeasuredTime)/1000;

    if (msg) {
      console.log(msg + seconds)
    }
    return seconds;
  }

  Util.mergeObjects = function(a, b) {
    var result = { };
    if (a) {
      for(var prop in a) {
        result[prop] = a[prop];
      }
    }
    if (b) {
      for(var prop in b) {
        result[prop] = b[prop];
      }
    }
    return result;
  }

  return Util;
});
