define(["pex/core/Context", "pex/core/Program", "pex/core/Vbo"], function(Context, Program, Vbo) {
  var vert = ""
    + "attribute vec2 position;"
    + "attribute vec2 texCoord;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_Position = vec4(position, 0.0, 1.0);"
    +  "vTexCoord = texCoord;"
    + "}";

  var frag = [
    "varying vec2 vTexCoord;",
    "uniform sampler2D tex0;",
    "void main() {",
      "gl_FragColor = texture2D(tex0, vTexCoord);",
    "}"
  ].join("\n");

  function FullScreenQuad() {
    var gl = Context.currentContext.gl;
    this.program = new Program(vert, frag);
    this.vbo = new Vbo(gl.TRIANGLES);

    var vertices = [
      -1,  1,
      -1, -1,
       1, -1,
       1,  1
    ];

    var texCoords = [
       0,  1,
       0,  0,
       1,  0,
       1,  1
    ];

    var indices = [
      0, 1, 2,
      2, 3, 0
    ];

    this.vbo.addAttrib("position", vertices, 2);
    this.vbo.addAttrib("texCoord", texCoords, 2);
    this.vbo.setIndices(indices);
  }

  FullScreenQuad.prototype.draw = function(program) {
    program = program ? program : this.program;
    program.use();
    this.vbo.draw(program);
  };

  return FullScreenQuad;
});