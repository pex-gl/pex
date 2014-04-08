(function() {
  define(function(require) {
    var Path, Vec3;
    Vec3 = require('pex/geom/Vec3');
    return Path = (function() {
      function Path(points) {
        this.points = points || [];
        this.dirtyLength = true;
        this.loop = false;
        this.samplesCount = 200;
      }

      Path.prototype.addPoint = function(p) {
        return this.points.push(p);
      };

      Path.prototype.getPoint = function(t, debug) {
        var c0, c1, intPoint, point, vec, weight;
        point = t * (this.points.length - 1);
        intPoint = Math.floor(point);
        weight = point - intPoint;
        c0 = intPoint;
        c1 = intPoint + 1;
        if (intPoint === this.points.length - 1) {
          c0 = intPoint;
          c1 = intPoint;
        }
        vec = new Vec3();
        vec.x = this.points[c0].x + (this.points[c1].x - this.points[c0].x) * weight;
        vec.y = this.points[c0].y + (this.points[c1].y - this.points[c0].y) * weight;
        vec.z = this.points[c0].z + (this.points[c1].z - this.points[c0].z) * weight;
        return vec;
      };

      Path.prototype.getPointAt = function(d) {
        var i, k, _i, _ref;
        if (!this.loop) {
          d = Math.max(0, Math.min(d, 1));
        }
        if (this.dirtyLength) {
          this.precalculateLength();
        }
        k = 0;
        for (i = _i = 0, _ref = this.accumulatedLengthRatios.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (this.accumulatedLengthRatios[i] >= d) {
            k = this.accumulatedRatios[i];
            break;
          }
        }
        return this.getPoint(k, true);
      };

      Path.prototype.close = function() {
        return this.loop = true;
      };

      Path.prototype.isClosed = function() {
        return this.loop;
      };

      Path.prototype.reverse = function() {
        this.points = this.points.reverse();
        return this.dirtyLength = true;
      };

      Path.prototype.precalculateLength = function() {
        var i, k, len, point, prevPoint, step, totalLength, _i, _j, _ref, _ref1;
        step = 1 / this.samplesCount;
        k = 0;
        totalLength = 0;
        this.accumulatedRatios = [];
        this.accumulatedLengthRatios = [];
        this.accumulatedLengths = [];
        point = null;
        prevPoint = null;
        for (i = _i = 0, _ref = this.samplesCount; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          prevPoint = point;
          point = this.getPoint(k);
          if (i > 0) {
            len = point.dup().sub(prevPoint).length();
            totalLength += len;
          }
          this.accumulatedRatios.push(k);
          this.accumulatedLengths.push(totalLength);
          k += step;
        }
        for (i = _j = 0, _ref1 = this.accumulatedLengths.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          this.accumulatedLengthRatios.push(this.accumulatedLengths[i] / totalLength);
        }
        this.length = totalLength;
        return this.dirtyLength = false;
      };

      return Path;

    })();
  });

}).call(this);
