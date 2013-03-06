define(['pex/sys/Node', 'pex/utils/Time'], function(Node, Time) {
  var plask;

  function Window() {
  }

  Window.create = function(obj) {
    var gl = null;
    var context = null;

    obj.__init = obj.init;
    obj.init = function() {
      gl = this.gl;
      //require(["pex/core/Context"], function(Context) {
      //  context = new Context(gl);
      //  Context.currentContext = context;
      //  if (obj.__init) {
      //    obj.framerate(60); //default to 60fps
      //    obj.__init();
      //  }
      //});
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      //Time.update();
      //Context.currentContext = context;
      if (obj.__draw) {
        obj.__draw();
      }
    }

    return Node.plask.simpleWindow(obj);
  }

  return Window;

});