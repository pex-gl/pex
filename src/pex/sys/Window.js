(function() {
  define(function(require) {
    var BrowserWindow, Context, Node, ObjectUtils, Platform, Time, Window, omgcanvas;
    Platform = require('pex/sys/Platform');
    Node = require('pex/sys/Node');
    Context = require('pex/gl/Context');
    BrowserWindow = require('pex/sys/BrowserWindow');
    ObjectUtils = require('pex/utils/ObjectUtils');
    Time = require('pex/utils/Time');
    omgcanvas = require('lib/omgcanvas');
    return Window = {
      create: function(obj) {
        var context, defaultSettings, gl;
        gl = null;
        context = null;
        defaultSettings = {
          width: 1280,
          height: 720,
          type: '3d',
          vsync: true,
          multisample: true,
          fullscreen: false,
          center: true
        };
        obj.settings = obj.settings || {};
        obj.settings = ObjectUtils.mergeObjects(defaultSettings, obj.settings);
        obj.__init = obj.init;
        obj.init = function() {
          gl = this.gl;
          context = new Context(gl);
          Context.currentContext = context;
          if (Platform.isPlask && obj.settings.type === '2d') {
            obj.ctx = new omgcanvas.CanvasContext(this.canvas);
          }
          obj.framerate(60);
          if (obj.__init) {
            return obj.__init();
          }
        };
        obj.__draw = obj.draw;
        obj.draw = function() {
          Time.update();
          Context.currentContext = context;
          if (obj.__draw) {
            return obj.__draw();
          }
        };
        obj.dispose = function() {};
        if (Platform.isPlask) {
          return Node.plask.simpleWindow(obj);
        }
        if (Platform.isBrowser) {
          return BrowserWindow.simpleWindow(obj);
        }
      }
    };
  });

}).call(this);
