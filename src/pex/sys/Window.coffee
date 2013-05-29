define (require) ->
  Platform = require('pex/sys//Platform')
  Node = require('pex/sys/Node')
  Context = require('pex/gl/Context')
  BrowserWindow = require('pex/sys/BrowserWindow')
  ObjectUtils = require('pex/utils/ObjectUtils')

  Window =
    create: (obj) ->
      gl = null;
      context = null;

      defaultSettings =
        width: 1280
        height: 720
        type: '3d'
        vsync: true
        multisample: true
        fullscreen: false
        center: true

      obj.setttings = obj.settings || {}

      obj.settings = ObjectUtils.mergeObjects(defaultSettings, obj.settings)

      obj.__init = obj.init;
      obj.init = () ->
        gl = this.gl
        context = new Context(gl)
        Context.currentContext = context;
        if obj.__init
          obj.framerate(60)
          obj.__init()

      obj.__draw = obj.draw;
      obj.draw = () ->
        #Time.update()
        Context.currentContext = context;
        if obj.__draw
          obj.__draw()

      Node.plask.simpleWindow(obj) if Platform.isPlask
      BrowserWindow.simpleWindow(obj) if Platform.isBrowser
