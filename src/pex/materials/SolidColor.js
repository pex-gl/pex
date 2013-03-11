define(['pex/materials/Material', "pex/gl", "pex/geom", "pex/utils/ObjectUtils"], function(Material, gl, geom, ObjectUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float pointSize;"
    + "attribute vec3 position;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    + "}";

  var frag = ""
    + "uniform vec4 color;"
    + "void main() {"
    +  "gl_FragColor = color;"
    + "}";


  function SolidColor(uniforms) {
    this.gl = gl.Context.currentContext.gl;
    var program = new gl.Program(solidColorVert, solidColorFrag);

    var defaults = {
     color : geom.Vec4.fromValues(1, 1, 1, 1),
     pointSize : 1
    }

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  SolidColor.prototype = new Material();

  return SolidColor;
});