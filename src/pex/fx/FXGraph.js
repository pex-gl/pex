define(['pex/gl/Context', 'pex/fx/FXResourceMgr', 'pex/gl/ScreenImage', 'pex/gl/RenderTarget'],
  function(Context, FXResourceMgr, ScreenImage, RenderTarget) {
  function FXGraph(stack, resourceMgr, fullscreenQuad) {
    this.gl = Context.currentContext.gl;
    this.stack = stack || [];
    this.resourceMgr = resourceMgr || new FXResourceMgr();
    this.fullscreenQuad = fullscreenQuad || new ScreenImage();
    this.defaultBPP = 8;
  }

  FXGraph.prototype.reset = function() {
    this.stack = [];
    this.resourceMgr.markAllAsNotUsed();

    var viewport = this.gl.getParameter(this.gl.VIEWPORT);
    this.outputSize = { width: viewport[2], height: viewport[3] };
  }

  FXGraph.prototype.getRenderTarget = function(w, h, depth, bpp) {
    depth = depth || false;
    bpp = bpp || this.defaultBPP;

    var resProps = {w:w, h:h, depth:depth, bpp:bpp};
    var res = this.resourceMgr.getResource('RenderTarget', resProps);
    if (!res) {
      var renderTarget = new RenderTarget(w, h, resProps);
      res = this.resourceMgr.addResource('RenderTarget', renderTarget, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXGraph.prototype.getShader = function(code) {
    if (code.indexOf('.glsl') == code.length - 5) {
      throw 'FXGraph.getShader - loading files not supported yet.';
    }
    var resProps = {code: code};
    var res = this.resourceMgr.getResource('Program', resProps);
    if (!res) {
      var program = new gl.Program(code);
      res = this.resourceMgr.addResource('Program', program, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXGraph.prototype.getImage = function(path) {
    var resProps = {path: path};
    var res = this.resourceMgr.getResource('Image', resProps);
    if (!res) {
      var image = gl.Texture2D.load(path);
      res = this.resourceMgr.addResource('Image', image, resProps);
    }
    res.used = false; //can be shared so no need for locking
    return res.obj;
  }

  FXGraph.prototype.getOutputSize = function(width, height, verbose) {
    if (width && height) {
      return { width: width, height: height };
    }
    var source = this.getSource(verbose);
    if (source) {
      return { width: source.width, height: source.height };
    }
    return { width : this.outputSize.width, height : this.outputSize.width };
  }

  FXGraph.prototype.getSource = function() {
    if (this.stack.length > 0) return this.stack[this.stack.length - 1];
    else return null;
  }

  FXGraph.prototype.getSourceTexture = function(source) {
    var source = source || this.getSource();
    if (source) {
      if (source.getColorAttachement) {
        return source.getColorAttachement(0);
      }
      else if (source.stack) {
        if (source.stack.length > 0) {
          return this.getSourceTexture(source.stack[source.stack.length - 1]);
        }
        else {
          throw 'FXGraph.getSourceTexture() Source is FXGraph with empty stack!';
        }
      }
      else return source;
    }
    else throw 'FXGraph.getSourceTexture() No source texture!';
  }

  FXGraph.prototype.getFullScreenQuad = function() {
    return this.fullscreenQuad;
  }

  FXGraph.prototype.drawFullScreenQuad = function(width, height, program) {
    this.drawFullScreenQuadAt(0, 0, width, height, program);
  }

  FXGraph.prototype.drawFullScreenQuadAt = function(x, y, width, height, program) {
    var gl = this.gl;
    gl.disable(gl.DEPTH_TEST);

    var oldViewport = this.gl.getParameter(this.gl.VIEWPORT);
    gl.viewport(x, y, width, height);

    var oldProgram;
    if (program) {
      oldProgram = this.fullscreenQuad.program;
      this.fullscreenQuad.program = program;
      program.use();
    }
    this.fullscreenQuad.draw();
    if (oldProgram) {
      this.fullscreenQuad.program = oldProgram;
    }
    gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
  }

  FXGraph.prototype.dup = function(options) {
    var newStack = this.stack.map(function(fx) { return fx; });
    var clone = this.resourceMgr.getResource('FXGraph');
    if (!clone) {
      var graph = new FXGraph(null, this.resourceMgr, this.fullscreenQuad);
      clone = this.resourceMgr.addResource('FXGraph', graph, {});
    }
    clone.used = true;
    clone.obj.stack = newStack;
    clone.obj.defaultBPP = this.defaultBPP;

    return clone.obj;
  }

  FXGraph.prototype.toString = function() {
    return '[' + this.stack.map(function(t) { return t.name || 'Unknown'; }).join(',') + ']';
  }

  return FXGraph;
})