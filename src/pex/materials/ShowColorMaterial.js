define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float pointSize;"    
    + "attribute vec3 position;"
    + "attribute vec4 color;"
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    +  "vColor = color;"
    + "}";

  var frag = ""
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_FragColor = vColor;"
    + "}";


  function ShowColorMaterial(uniforms) {
      this.gl = Core.Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);

      var defaults = {
       pointSize : 1
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  ShowColorMaterial.prototype = new Core.Material();

  return ShowColorMaterial;
});