//A ray.  
//
//Consists of the starting point *origin* and the *direction* vector.  
//Used for collision detection.
define(['pex/geom/Vec3'], function(Vec3) {

  //### Ray ( )
  function Ray(origin, direction) {
    this.origin = origin || new Vec3(0, 0, 0);
    this.direction = direction || new Vec3(0, 0, 1)
  }

  //http://wiki.cgsociety.org/index.php/Ray_Sphere_Intersection
  Ray.prototype.hitTestSphere = function(pos, r) {
    var hits = [];

    var d = this.direction;
    var o = this.origin;
    var osp = o.dup().sub(pos);

    var A = d.dot(d);
    if (A == 0) {
      return hits;
    }

    var B = 2 * osp.dot(d);
    var C = osp.dot(osp) - r * r;
    var sq = Math.sqrt(B*B - 4*A*C);

    if (isNaN(sq)) {
      return hits
    }

    var t0 = (-B - sq) / (2 * A);
    var t1 = (-B + sq) / (2 * A);

    hits.push(o.dup().add(d.dup().scale(t0)));
    if (t0 != t1) {
      hits.push(o.dup().add(d.dup().scale(t1)));
    }

    return hits;
  }

  //http://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
  //http://cgafaq.info/wiki/Ray_Plane_Intersection
  Ray.prototype.hitTestPlane = function(pos, normal) {
    if (this.direction.dot(normal) == 0) {
      return [];
    }

    var t = normal.dup().scale(-1).dot(this.origin.dup().sub(pos)) / this.direction.dot(normal);

    return [this.origin.dup().add(this.direction.dup().scale(t))];
  }

  return Ray;
});