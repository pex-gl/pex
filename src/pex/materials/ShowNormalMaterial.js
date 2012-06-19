define(["pex/core/Core"], function(Core) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    +  "vNormal = normal;"
    + "}";

  var frag = ""
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "gl_FragColor.rgb = 0.5 + 0.5 * normalize(vNormal);"
    +  "gl_FragColor.a = 1.0;"
    + "}";


  function TestMaterial() {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);
  }

  TestMaterial.prototype = new Core.Material();

  return TestMaterial;
});