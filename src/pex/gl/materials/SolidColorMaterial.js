define(["pex/geom", "pex/utils/ObjectUtils"], function(geom, ObjectUtils) {

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
    this.gl = Core.Context.currentContext.gl;
    var program = new Core.Program(solidColorVert, solidColorFrag);

    var defaults = {
     color : new geom.Vec4(1, 1, 1, 1),
     pointSize : 1
    }

    var uniforms = ObjUtils.mergeObjects(defaults, uniforms);

    Core.Material.call(this, program, uniforms);
  }

  SolidColorMaterial.prototype = new Core.Material();

  return SolidColorMaterial;
});