define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var solidColorVert = ""
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

  var solidColorFrag = ""
    + "uniform sampler2D texture;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_FragColor = texture2D(texture, vTexCoord);"
    + "}";


  function TexturedMaterial(uniforms) {
      this.gl = Core.Core.Context.currentContext.gl;
      this.program = new Core.Program(solidColorVert, solidColorFrag);
      this.uniforms = ObjUtils.mergeObjects({}, uniforms);
  }

  TexturedMaterial.prototype = new Core.Material();

  return TexturedMaterial;
});