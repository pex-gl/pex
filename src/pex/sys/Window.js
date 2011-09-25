define(["plask", "pex/core/Context"], function(plask, Context) {

  function Window() {}

  Window.create = function(obj) {
    var gl = null;

    //we overwrite obj's init function to capture GL context before init() gets executed
    obj.__init = obj.init;
    obj.init = function() {
      gl = this.gl;
      require(["pex/core/Context"], function(Context) {
        Context.currentContext = gl;
        if (obj.__init) {
          obj.__init();
        }
      });
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Context.currentContext = gl;
      if (obj.__draw) {
        obj.__draw();
      }
    }

    return plask.simpleWindow(obj);
  }

  return Window;

});