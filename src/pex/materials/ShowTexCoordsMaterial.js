define(["pex/core/Core"], function(Core) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec2 texCoord;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    +  "vTexCoord = texCoord;"
    + "}";

  var frag = ""
    + "varying vec3 vNormal;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_FragColor.rgba = vec4(vTexCoord, 0.0, 1.0);"
    + "}";


  function ShowTextCoordsMaterial() {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);
  }

  ShowTextCoordsMaterial.prototype = new Core.Material();

  return ShowTextCoordsMaterial;
});