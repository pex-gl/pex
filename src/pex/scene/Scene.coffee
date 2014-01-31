define (require) ->

  Context = require('pex/gl/Context')
  Mesh = require('pex/gl/Mesh')
  Color = require('pex/color/Color')
  PerspectiveCamera = require('pex/scene/PerspectiveCamera')

  class Scene
    currentCamera: -1
    clearColor: Color.BLACK
    clearDepth: true
    viewport: null
    constructor: () ->
      @drawables = []
      @cameras = []
      @gl = Context.currentContext.gl

    setClearColor: (color) ->
      @clearColor = color

    setClearDepth: (clearDepth) ->
      @clearDepth = clearDepth

    setViewport: (viewport) ->
      @viewport = viewport

    add: (obj) ->
      if (obj.draw)
        @drawables.push(obj)
      if (obj instanceof PerspectiveCamera)
        @cameras.push(obj)

    remove: (obj) ->
      index = @drawables.indexOf(obj)
      if index != -1
        @drawables.splice(index, 1)

    clear: () ->
      clearBits = 0
      #TODO persist oldClearColorValue
      if @clearColor
        @gl.clearColor(@clearColor.r, @clearColor.g, @clearColor.b, @clearColor.a)
        clearBits |= @gl.COLOR_BUFFER_BIT
      if @clearDepth
        clearBits |= @gl.DEPTH_BUFFER_BIT
      if clearBits
        @gl.clear(clearBits)

    draw: (camera) ->
      if !camera
        if @currentCamera >= 0 && @currentCamera < @cameras.length
          camera = @cameras[@currentCamera]
        else if @cameras.length > 0
          camera = @cameras[0]
        else
          throw 'Scene.draw: missing a camera'

      if @viewport
        @viewport.bind()
        aspectRatio = @viewport.bounds.width / @viewport.bounds.height
        if camera.getAspectRatio() != aspectRatio
          camera.setAspectRatio(aspectRatio)

      @clear()

      for drawable in @drawables
        drawable.draw(camera) if drawable.enabled != false

      if @viewport
        @viewport.unbind()

