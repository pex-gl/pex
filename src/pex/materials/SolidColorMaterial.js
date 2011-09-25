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


  function SolidColorMaterial(uniforms) {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(solidColorVert, solidColorFrag);

      var defaults = {
       color : new Core.Vec4(1, 1, 1, 1)
      }

      this.uniforms = uniforms || defaults;
  }

  SolidColorMaterial.prototype = new Core.Material();

  return SolidColorMaterial;
});