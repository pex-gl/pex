define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float near;"
    + "uniform float far;"
    + "attribute vec3 position;"
    + "attribute vec4 color;"
    + "varying float depth;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "depth = (-(modelViewMatrix * vec4(position, 1.0)).z - near)/(far - near) ;"
    + "}";

  var frag = ""
    + "varying float depth;"
    + "void main() {"
    +  "gl_FragColor = vec4(depth, depth, depth, 1.0);"
    + "}";


  function ShowColorMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);

      var defaults = {
        near: 0.1,
        far: 100
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  ShowColorMaterial.prototype = new Core.Material();

  return ShowColorMaterial;
});