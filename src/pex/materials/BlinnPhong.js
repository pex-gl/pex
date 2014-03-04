(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var BlinnPhong, BlinnPhongGLSL, Color, Context, Material, ObjectUtils, Program, Vec3;
    Material = require('pex/materials/Material');
    Context = require('pex/gl/Context');
    Program = require('pex/gl/Program');
    ObjectUtils = require('pex/utils/ObjectUtils');
    Vec3 = require('pex/geom/Vec3');
    Color = require('pex/color/Color');
    BlinnPhongGLSL = require('lib/text!./BlinnPhong.glsl');
    return BlinnPhong = (function(_super) {
      __extends(BlinnPhong, _super);

      function BlinnPhong(uniforms) {
        var defaults, program;
        this.gl = Context.currentContext.gl;
        program = new Program(BlinnPhongGLSL);
        defaults = {
          wrap: 0,
          pointSize: 1,
          lightPos: Vec3.create(10, 20, 30),
          ambientColor: Color.create(0, 0, 0, 1),
          diffuseColor: Color.create(1, 1, 1, 1),
          specularColor: Color.create(1, 1, 1, 1),
          shininess: 32,
          useBlinnPhong: true
        };
        uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
        BlinnPhong.__super__.constructor.call(this, program, uniforms);
      }

      return BlinnPhong;

    })(Material);
  });

}).call(this);
