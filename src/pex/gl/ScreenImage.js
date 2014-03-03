define([
  'pex/geom/Vec2',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/materials/Material',
  'pex/geom/Face3',
  'pex/geom/Geometry',
  'pex/gl/Mesh',
  'lib/text!pex/gl/ScreenImage.glsl'
], function (Vec2, Context, Program, Material, Face3, Geometry, Mesh, ScreenImageGLSL) {
  function ScreenImage(image, x, y, w, h, screenWidth, screenHeight) {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    w = w !== undefined ? w : 1;
    h = h !== undefined ? h : 1;
    screenWidth = screenWidth !== undefined ? screenWidth : 1;
    screenHeight = screenHeight !== undefined ? screenHeight : 1;
    this.image = image;
    var program = new Program(ScreenImageGLSL);
    var uniforms = {
        screenSize: Vec2.create(screenWidth, screenHeight),
        pixelPosition: Vec2.create(x, y),
        pixelSize: Vec2.create(w, h),
        alpha: 1
      };
    if (image)
      uniforms.image = image;
    var material = new Material(program, uniforms);
    var vertices = [
        new Vec2(-1, 1),
        new Vec2(1, 1),
        new Vec2(1, -1),
        new Vec2(-1, -1)
      ];
    var texCoords = [
        new Vec2(0, 1),
        new Vec2(1, 1),
        new Vec2(1, 0),
        new Vec2(0, 0)
      ];
    var geometry = new Geometry({
        vertices: vertices,
        texCoords: texCoords
      });
    // 0----1  0,1   1,1
    // | \  |      u
    // |  \ |      v
    // 3----2  0,0   0,1
    geometry.faces.push(new Face3(0, 2, 1));
    geometry.faces.push(new Face3(0, 3, 2));
    this.mesh = new Mesh(geometry, material);
  }
  ScreenImage.prototype.setAlpha = function (alpha) {
    this.mesh.material.uniforms.alpha = alpha;
  };
  ScreenImage.prototype.setPosition = function (position) {
    this.mesh.material.uniforms.pixelPosition = position;
  };
  ScreenImage.prototype.setSize = function (size) {
    this.mesh.material.uniforms.pixelSize = size;
  };
  ScreenImage.prototype.setWindowSize = function (size) {
    this.mesh.material.uniforms.windowSize = size;
  };
  ScreenImage.prototype.setBounds = function (bounds) {
    this.mesh.material.uniforms.pixelPosition.x = bounds.x;
    this.mesh.material.uniforms.pixelPosition.y = bounds.y;
    this.mesh.material.uniforms.pixelSize.x = bounds.width;
    this.mesh.material.uniforms.pixelSize.y = bounds.height;
  };
  ScreenImage.prototype.setImage = function (image) {
    this.image = image;
    this.mesh.material.uniforms.image = image;
  };
  ScreenImage.prototype.draw = function (image, program) {
    var oldImage = null;
    if (image) {
      oldImage = this.mesh.material.uniforms.image;
      this.mesh.material.uniforms.image = image;
    }
    var oldProgram = null;
    if (program) {
      oldProgram = this.mesh.getProgram();
      this.mesh.setProgram(program);
    }
    this.mesh.draw();
    if (oldProgram) {
      this.mesh.setProgram(oldProgram);
    }
    if (oldImage) {
      this.mesh.material.uniforms.image = oldImage;
    }
  };
  return ScreenImage;
});