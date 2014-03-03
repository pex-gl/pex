(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Color, Edge, Geometry, LineBuilder, Vec3;
    Vec3 = require('pex/geom/Vec3');
    Edge = require('pex/geom/Edge');
    Color = require('pex/color/Color');
    Geometry = require('pex/geom/Geometry');
    return LineBuilder = (function(_super) {
      __extends(LineBuilder, _super);

      function LineBuilder() {
        LineBuilder.__super__.constructor.call(this, {
          vertices: true,
          colors: true
        });
      }

      LineBuilder.prototype.addLine = function(a, b, colorA, colorB) {
        colorA = colorA || Color.White;
        colorB = colorB || colorA;
        this.vertices.push(Vec3.create().copy(a));
        this.vertices.push(Vec3.create().copy(b));
        this.colors.push(Color.create().copy(colorA));
        this.colors.push(Color.create().copy(colorB));
        this.vertices.dirty = true;
        return this.colors.dirty = true;
      };

      LineBuilder.prototype.addCross = function(pos, size, color) {
        var halfSize;
        size = size || 0.1;
        halfSize = size / 2;
        color = color || Color.White;
        this.vertices.push(Vec3.create().set(pos.x - halfSize, pos.y, pos.z));
        this.vertices.push(Vec3.create().set(pos.x + halfSize, pos.y, pos.z));
        this.vertices.push(Vec3.create().set(pos.x, pos.y - halfSize, pos.z));
        this.vertices.push(Vec3.create().set(pos.x, pos.y + halfSize, pos.z));
        this.vertices.push(Vec3.create().set(pos.x, pos.y, pos.z - halfSize));
        this.vertices.push(Vec3.create().set(pos.x, pos.y, pos.z + halfSize));
        this.colors.push(Color.create().copy(color));
        this.colors.push(Color.create().copy(color));
        this.colors.push(Color.create().copy(color));
        this.colors.push(Color.create().copy(color));
        this.colors.push(Color.create().copy(color));
        return this.colors.push(Color.create().copy(color));
      };

      LineBuilder.prototype.reset = function() {
        this.vertices.length = 0;
        this.colors.length = 0;
        this.vertices.dirty = true;
        return this.colors.dirty = true;
      };

      return LineBuilder;

    })(Geometry);
  });

}).call(this);
