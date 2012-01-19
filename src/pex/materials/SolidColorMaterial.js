define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var solidColorVert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float pointSize;"
    + "attribute vec3 position;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    + "}";

  var solidColorFrag = ""
    + "uniform vec4 color;"
    + "void main() {"
    +  "gl_FragColor = color;"
    + "}";


  function SolidColorMaterial(uniforms) {
      this.gl = Core.Core.Context.currentContext.gl;
      this.program = new Core.Program(solidColorVert, solidColorFrag);

      var defaults = {
       color : new Core.Vec4(1, 1, 1, 1),
       pointSize : 1
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  SolidColorMaterial.prototype = new Core.Material();

  return SolidColorMaterial;
});