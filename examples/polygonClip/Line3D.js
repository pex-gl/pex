(function() {
  define(function(require) {
    var Line3D, Vec3;
    Vec3 = require('pex/geom/Vec3');
    return Line3D = (function() {
      function Line3D(a, b) {
        this.a = a;
        this.b = b;
        this.direction = Vec3.create().asSub(this.b, this.a).normalize();
      }

      return Line3D;

    })();
  });

}).call(this);
