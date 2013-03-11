define(['pex/materials/Material', 'pex/gl', 'pex/geom', 'pex/utils/ObjectUtils'], function(Material, gl, geom, ObjectUtils) {

  var vert = ''
    //+ 'precision highp float;';
    //+ 'precision highp int;';
    + 'uniform mat4 projectionMatrix;'
    + 'uniform mat4 modelViewMatrix;'
    + 'uniform float pointSize;'
    + 'attribute vec3 position;'
    + 'attribute vec3 normal;'
    + 'varying vec4 vColor;'
    + 'void main() {'
    +  'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);'
    +  'gl_PointSize = pointSize;'
    +  'vColor = vec4(normal * 0.5 + 0.5, 1.0);'
    + '}';

  var frag = ''
    + 'varying vec4 vColor;'
    + 'void main() {'
    +  'gl_FragColor = vColor;'
    + '}';


  function ShowNormals(uniforms) {
    this.gl = gl.Context.currentContext.gl;
    var program = new gl.Program(vert, frag);

    var defaults = {
     color : geom.Vec4.fromValues(1, 1, 1, 1),
     pointSize : 1
    }

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  ShowNormals.prototype = Object.create(Material.prototype);

  return ShowNormals;
});