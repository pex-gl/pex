(function() {
  define(function(require) {
    var Context, Viewport;
    Context = require('pex/gl/Context');
    return Viewport = (function() {
      function Viewport(parent, bounds) {
        this.parent = parent;
        this.bounds = bounds;
        this.gl = Context.currentContext.gl;
      }

      Viewport.prototype.bind = function() {
        var parentHeight, _ref;
        if (this.oldViewport) {
          throw 'Viewport.bind: Already bound.';
        }
        this.oldViewport = this.gl.getParameter(this.gl.VIEWPORT);
        this.oldScissorBox = this.gl.getParameter(this.gl.SCISSOR_BOX);
        this.oldScissorTest = this.gl.getParameter(this.gl.SCISSOR_TEST);
        parentHeight = this.parent.height || ((_ref = this.parent.bounds) != null ? _ref.height : void 0);
        this.gl.enable(this.gl.SCISSOR_TEST);
        this.gl.scissor(this.bounds.x, parentHeight - this.bounds.y - this.bounds.height, this.bounds.width, this.bounds.height);
        return this.gl.viewport(this.bounds.x, parentHeight - this.bounds.y - this.bounds.height, this.bounds.width, this.bounds.height);
      };

      Viewport.prototype.unbind = function() {
        this.gl.viewport(this.oldViewport[0], this.oldViewport[1], this.oldViewport[2], this.oldViewport[3]);
        this.gl.scissor(this.oldScissorBox[0], this.oldScissorBox[1], this.oldScissorBox[2], this.oldScissorBox[3]);
        this.oldViewport = null;
        if (!this.oldScissorTest) {
          return this.gl.disable(this.gl.SCISSOR_TEST);
        }
      };

      return Viewport;

    })();
  });

}).call(this);
