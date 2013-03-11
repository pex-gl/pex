define(['pex/gl/Context', 'pex/materials/Material', 'pex/gl/Program', 'pex/utils/ObjectUtils'],
  function(Context, Material, Program, ObjectUtils) {

  var vert = ''
    + 'uniform mat4 projectionMatrix;'
    + 'uniform mat4 modelViewMatrix;'
    + 'attribute vec3 position;'
    + 'attribute vec2 texCoord;'
    + 'varying vec2 vTexCoord;'
    + 'void main() {'
    +  'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);'
    +  'gl_PointSize = 2.0;'
    +  'vTexCoord = texCoord;'
    + '}';

  var frag = ''
    + 'uniform sampler2D texture;'
    + 'varying vec2 vTexCoord;'
    + 'void main() {'
    +  'gl_FragColor = texture2D(texture, vTexCoord);'
    + '}';


  function Textured(uniforms) {
      this.gl = Context.currentContext.gl;
      var program = new Program(vert, frag);
      var uniforms = ObjectUtils.mergeObjects({}, uniforms);

      Material.call(this, program, uniforms);
  }

  Textured.prototype = Object.create(Material.prototype);

  return Textured;
});