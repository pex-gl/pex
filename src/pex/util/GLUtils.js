define(["pex/util/Log", "pex/core/Context"], function(Log, Context) {
  function GLUtils() {
  }

  var gl_enums = null;

  GLUtils.checkGLErrors = function(msg) {
    var gl = Context.currentContext.gl;
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
      Log.error(msg + " (" + gl_enums[err] + ")");
    }
  }

  return GLUtils;
});
