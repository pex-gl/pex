define(["pex/core/Core"], function(Core) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec4 color;"
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    +  "vColor = color;"
    + "}";

  var frag = ""
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_FragColor = vColor;"
    + "}";


  function ShowColorMaterial() {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(vert, frag);

      this.uniforms = {};
  }

  ShowColorMaterial.prototype = new Core.Material();

  return ShowColorMaterial;
});