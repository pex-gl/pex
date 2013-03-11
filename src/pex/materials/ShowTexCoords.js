define(['pex/materials/Material', "pex/gl", "pex/geom", "pex/utils/ObjectUtils"], function(Material, gl, geom, ObjectUtils) {

  var vert = ""
    //+ "precision highp float;";
    //+ "precision highp int;";
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float pointSize;"
    + "attribute vec3 position;"
    + "attribute vec2 texCoord;"
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    +  "vColor = vec4(texCoord, 1.0, 1.0);"
    + "}";

  var frag = ""
    + "varying vec4 vColor;"
    + "void main() {"
    +  "gl_FragColor = vColor;"
    + "}";


  function ShowTexCoords(uniforms) {
    this.gl = gl.Context.currentContext.gl;
    var program = new gl.Program(vert, frag);

    var defaults = {
     pointSize : 1
    }

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowTexCoords.prototype = new Material();

  return ShowTexCoords;
});