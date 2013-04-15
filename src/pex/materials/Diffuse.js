define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/geom/Vec3',
  'pex/geom/Vec4',
  'lib/text!pex/materials/Diffuse.glsl'
  ], function(Material, Context, Program, ObjectUtils, Vec3, Vec4, DiffuseGLSL) {

  function Diffuse(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(DiffuseGLSL);

    var defaults = {
      pointSize : 1,
      lightPos : Vec3.create(10, 10, 10),
      ambientColor : Vec4.create(0, 0, 0, 1),
      diffuseColor : Vec4.create(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  Diffuse.prototype = Object.create(Material.prototype);

  return Diffuse;
});