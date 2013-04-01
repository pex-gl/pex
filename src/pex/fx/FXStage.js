define([
  'pex/gl/Context',
  'pex/fx/FXResourceMgr',
  'pex/gl/ScreenImage',
  'pex/gl/RenderTarget',
  'pex/gl/Program',
  'pex/gl/Texture2D',
  'pex/geom/Vec2'
  ],
  function(Context, FXResourceMgr, ScreenImage, RenderTarget, Program, Texture2D, Vec2) {
  var FXStageCount = 0;
  function FXStage(source, resourceMgr, fullscreenQuad) {
    this.id = FXStageCount++;
    console.log("FXStage+ " + FXStageCount)
    this.gl = Context.currentContext.gl;
    this.source = source || null;
    this.resourceMgr = resourceMgr || new FXResourceMgr();
    this.fullscreenQuad = fullscreenQuad || new ScreenImage();
    this.defaultBPP = 8;
  }

  FXStage.prototype.reset = function() {
    this.resourceMgr.markAllAsNotUsed();
  }

  FXStage.prototype.getOutputSize = function(width, height, verbose) {
    if (width && height) {
      return { width: width, height: height };
    }
    else if (this.source) {
      return { width: this.source.width, height: this.source.height };
    }
    else {
      var viewport = this.gl.getParameter(this.gl.VIEWPORT);
      return { width: viewport[2], height: viewport[3] };
    }
  }

  FXStage.prototype.getRenderTarget = function(w, h, depth, bpp) {
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

  FXStage.prototype.getFXStage = function(name) {
    var resProps = {};
    var res = this.resourceMgr.getResource('FXStage', resProps);
    if (!res) {
      var fxState = new FXStage(null, this.resourceMgr, this.fullscreenQuad);
      res = this.resourceMgr.addResource('FXStage', fxState, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXStage.prototype.asFXStage = function(source, name) {
    var stage = this.getFXStage(name);
    stage.source = source;
    stage.name = name + '_' + stage.id;
    return stage;
  }

  FXStage.prototype.getShader = function(code) {
    if (code.indexOf('.glsl') == code.length - 5) {
      throw 'FXStage.getShader - loading files not supported yet.';
    }
    var resProps = {code: code};
    var res = this.resourceMgr.getResource('Program', resProps);
    if (!res) {
      var program = new Program(code);
      res = this.resourceMgr.addResource('Program', program, resProps);
    }
    res.used = true;
    return res.obj;
  }

  FXStage.prototype.getSourceTexture = function(source) {
    if (this.source) {
      if (this.source.getColorAttachement) {
        return this.source.getColorAttachement(0);
      }
      else return this.source;
    }
    else throw 'FXStage.getSourceTexture() No source texture!';
  }

  FXStage.prototype.drawFullScreenQuad = function(width, height, image, program) {
    this.drawFullScreenQuadAt(0, 0, width, height, image, program);
  }

  FXStage.prototype.drawFullScreenQuadAt = function(x, y, width, height, image, program) {
    var gl = this.gl;
    gl.disable(gl.DEPTH_TEST);

    var oldViewport = gl.getParameter(gl.VIEWPORT);
    gl.viewport(x, y, width, height);
    this.fullscreenQuad.draw(image, program);
    gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
  }

  FXStage.prototype.getImage = function(path) {
    var resProps = {path: path};
    var res = this.resourceMgr.getResource('Image', resProps);
    if (!res) {
      var image = Texture2D.load(path);
      res = this.resourceMgr.addResource('Image', image, resProps);
    }
    res.used = false; //can be shared so no need for locking
    return res.obj;
  }

  FXStage.prototype.getFullScreenQuad = function() {
    return this.fullscreenQuad;
  }


  return FXStage;
})