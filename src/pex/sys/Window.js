define(['pex/sys/Platform', 'pex/sys/Node', 'pex/utils/Time', 'pex/sys/BrowserWindow', 'pex/gl/Context'],
  function(Platform, Node, Time, BrowserWindow, Context) {
  var plask;

  function Window() {
  }

  Window.create = function(obj) {
    var gl = null;
    var context = null;

    obj.__init = obj.init;
    obj.init = function() {
      gl = this.gl;
      context = new Context(gl);
      Context.currentContext = context;
      if (obj.__init) {
        obj.framerate(60); //default to 60fps
        obj.__init();
      }
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Time.update();
      Context.currentContext = context;
      if (obj.__draw) {
        obj.__draw();
      }
    }

    if (Platform.isPlask) return Node.plask.simpleWindow(obj);
    else if (Platform.isBrowser) return BrowserWindow.simpleWindow(obj);
  }

  return Window;

});