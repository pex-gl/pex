define (require) ->

  Context = require('pex/gl/Context')

  class Viewport
    constructor: (@parent, @bounds) ->
      @gl = Context.currentContext.gl

    bind: ()->
      if (@oldViewport)
        throw 'Viewport.bind: Already bound.'
        return
      @oldViewport = @gl.getParameter(@gl.VIEWPORT)
      @oldScissorBox = @gl.getParameter(@gl.SCISSOR_BOX)
      @oldScissorTest = @gl.getParameter(@gl.SCISSOR_TEST)
      parentHeight = @parent.height || @parent.bounds?.height
      @gl.enable(@gl.SCISSOR_TEST)
      @gl.scissor(@bounds.x, parentHeight - @bounds.y - @bounds.height, @bounds.width, @bounds.height)
      @gl.viewport(@bounds.x, parentHeight - @bounds.y - @bounds.height, @bounds.width, @bounds.height)

    unbind: ()->
      @gl.viewport(@oldViewport[0], @oldViewport[1], @oldViewport[2], @oldViewport[3])
      @gl.scissor(@oldScissorBox[0], @oldScissorBox[1], @oldScissorBox[2], @oldScissorBox[3])
      @oldViewport = null
      if (!@oldScissorTest)
        @gl.disable(@gl.SCISSOR_TEST)