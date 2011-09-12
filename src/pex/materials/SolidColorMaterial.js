define(["pex/core/Core"], function(Core) {

  var solidColorVert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    + "}";

  var solidColorFrag = ""
    + "uniform vec4 color;"
    + "void main() {"
    +  "gl_FragColor = color;"
    + "}";


  function SolidColorMaterial(gl) {
      this.gl = gl;
      this.program = new Core.Program(this.gl, solidColorVert, solidColorFrag);
      this.uniforms = {
       color : new Core.Vec4(1, 1, 1, 1)
      }
  }

  SolidColorMaterial.prototype = new Core.Material();

  return SolidColorMaterial;
});