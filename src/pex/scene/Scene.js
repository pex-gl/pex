(function() {
  define(function(require) {
    var Color, Context, Mesh, PerspectiveCamera, Scene;
    Context = require('pex/gl/Context');
    Mesh = require('pex/gl/Mesh');
    Color = require('pex/color/Color');
    PerspectiveCamera = require('pex/scene/PerspectiveCamera');
    return Scene = (function() {
      Scene.prototype.currentCamera = -1;

      Scene.prototype.clearColor = Color.BLACK;

      Scene.prototype.clearDepth = true;

      Scene.prototype.viewport = null;

      function Scene() {
        this.drawables = [];
        this.cameras = [];
        this.gl = Context.currentContext.gl;
      }

      Scene.prototype.setClearColor = function(color) {
        return this.clearColor = color;
      };

      Scene.prototype.setClearDepth = function(clearDepth) {
        return this.clearDepth = clearDepth;
      };

      Scene.prototype.setViewport = function(viewport) {
        return this.viewport = viewport;
      };

      Scene.prototype.add = function(obj) {
        if (obj.draw) {
          this.drawables.push(obj);
        }
        if (obj instanceof PerspectiveCamera) {
          return this.cameras.push(obj);
        }
      };

      Scene.prototype.remove = function(obj) {
        var index;
        index = this.drawables.indexOf(obj);
        if (index !== -1) {
          return this.drawables.splice(index, 1);
        }
      };

      Scene.prototype.clear = function() {
        var clearBits;
        clearBits = 0;
        if (this.clearColor) {
          this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
          clearBits |= this.gl.COLOR_BUFFER_BIT;
        }
        if (this.clearDepth) {
          clearBits |= this.gl.DEPTH_BUFFER_BIT;
        }
        if (clearBits) {
          return this.gl.clear(clearBits);
        }
      };

      Scene.prototype.draw = function(camera) {
        var aspectRatio, drawable, _i, _len, _ref;
        if (!camera) {
          if (this.currentCamera >= 0 && this.currentCamera < this.cameras.length) {
            camera = this.cameras[this.currentCamera];
          } else if (this.cameras.length > 0) {
            camera = this.cameras[0];
          } else {
            throw 'Scene.draw: missing a camera';
          }
        }
        if (this.viewport) {
          this.viewport.bind();
          aspectRatio = this.viewport.bounds.width / this.viewport.bounds.height;
          if (camera.getAspectRatio() !== aspectRatio) {
            camera.setAspectRatio(aspectRatio);
          }
        }
        this.clear();
        _ref = this.drawables;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          drawable = _ref[_i];
          if (drawable.enabled !== false) {
            drawable.draw(camera);
          }
        }
        if (this.viewport) {
          return this.viewport.unbind();
        }
      };

      return Scene;

    })();
  });

}).call(this);
