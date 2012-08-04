define(["pex/core/Context", "pex/core/Program", "pex/core/Vbo"], function(Context, Program, Vbo) {
  var vert = ""
    + "attribute vec2 position;"
    + "attribute vec2 texCoord;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_Position = vec4(position, 0.0, 1.0);"
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

    var vertices = [
      -1 + 2*x/screenWidth    ,  1 - 2*(y+h)/screenHeight,
      -1 + 2*x/screenWidth    ,  1 - 2*y/screenHeight,
      -1 + 2*(x+w)/screenWidth,  1 - 2*y/screenHeight,
      -1 + 2*(x+w)/screenWidth,  1 - 2*(y+h)/screenHeight
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

  ScreenImage.prototype.draw = function(program) {
    var gl = Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (this.tex) gl.bindTexture(gl.TEXTURE_2D, this.tex);
    program = program ? program : this.program;
    program.use();
    gl.disable(gl.DEPTH_TEST);
    this.vbo.draw(program);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  return ScreenImage;
});