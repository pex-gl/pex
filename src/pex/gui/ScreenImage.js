define(["pex/core/Vec2", "pex/core/Context", "pex/core/Program", "pex/core/Vbo"], function(Vec2, Context, Program, Vbo) {
  var vert = ""
    + "attribute vec2 position;"
    + "attribute vec2 texCoord;"
    + "uniform vec2 windowSize;"
    + "uniform vec2 pixelPosition;"
    + "uniform vec2 pixelSize;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "float x = -1.0 + 2.0 * (pixelPosition.x + pixelSize.x * position.x)/windowSize.x;"
    +  "float y = -1.0 + 2.0 * (pixelPosition.y + pixelSize.y * position.y)/windowSize.y;"
    +  "gl_Position = vec4(x, y, 0.0, 1.0);"
    +  "vTexCoord = texCoord;"
    + "}";

  var frag = ""
    + "varying vec2 vTexCoord;"
    + "uniform sampler2D tex0;"
    + "void main() {"
    +   "gl_FragColor = texture2D(tex0, vTexCoord);"
    + "}";

  function ScreenImage(screenWidth, screenHeight, x, y, w, h, tex) {
    var gl = Context.currentContext.gl;
    this.program = new Program(vert, frag);
    this.vbo = new Vbo(gl.TRIANGLES);
    this.tex = tex;
    this.windowSize = new Vec2(screenWidth, screenHeight);
    this.position = new Vec2(x, y);
    this.size = new Vec2(w, h);

    var vertices = [
       0, 0,
       0, 1,
       1, 1,
       1, 0
    ];

    var texCoords = [
       0,  0,
       0,  1,
       1,  1,
       1,  0
    ];

    var indices = [
      0, 1, 2,
      2, 3, 0
    ]

    this.vbo.addAttrib("position", vertices, 2);
    this.vbo.addAttrib("texCoord", texCoords, 2);
    this.vbo.setIndices(indices);
  }

  ScreenImage.prototype.setBounds = function(bounds) {
    this.position.x = bounds.x;
    this.position.y = bounds.y;
    this.size.x = bounds.width;
    this.size.y = bounds.height;
  }

  ScreenImage.prototype.setTexture = function(texture) {
    this.tex = texture;
  }

  ScreenImage.prototype.draw = function(program) {
    var gl = Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (this.tex) this.tex.bind();
    program = program ? program : this.program;
    program.use();
    program.uniforms.windowSize(this.windowSize);
    program.uniforms.pixelPosition(this.position);
    program.uniforms.pixelSize(this.size);
    gl.disable(gl.DEPTH_TEST);
    this.vbo.draw(program);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  return ScreenImage;
});