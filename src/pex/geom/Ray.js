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


  Ray.prototype.hitTestBoundingBox = function(bbox) {
    var hits = [];
    var self = this;
    function testFace(pos, size, normal, u, v) {
      var faceHits = self.hitTestPlane(pos, normal)
      if (faceHits.length > 0) {
        var hit = faceHits[0];
        if (hit[u] > pos[u] - size[u]/2 && hit[u] < pos[u] + size[u]/2 &&
          hit[v] > pos[v] - size[v]/2 && hit[v] < pos[v] + size[v]/2) {
          hits.push(hit);
        }
      }
    }

    var bboxCenter = bbox.getCenter();
    var bboxSize = bbox.getSize();
    testFace(bboxCenter.dup().add(new Vec3(0, 0, bboxSize.z/2)), bboxSize, new Vec3(0, 0, 1), 'x', 'y');
    testFace(bboxCenter.dup().add(new Vec3(0, 0, -bboxSize.z/2)), bboxSize, new Vec3(0, 0, -1), 'x', 'y');
    testFace(bboxCenter.dup().add(new Vec3(bboxSize.x/2, 0, 0)), bboxSize, new Vec3(1, 0, 0), 'y', 'z');
    testFace(bboxCenter.dup().add(new Vec3(-bboxSize.x/2, 0, 0)), bboxSize, new Vec3(-1, 0, 0), 'y', 'z');
    testFace(bboxCenter.dup().add(new Vec3(0, bboxSize.y/2, 0)), bboxSize, new Vec3(0, 1, 0), 'x', 'z');
    testFace(bboxCenter.dup().add(new Vec3(0, -bboxSize.y/2, 0)), bboxSize, new Vec3(0, -1, 0), 'x', 'z');

    hits.forEach(function(hit) {
      hit._distance = hit.distance(self.origin);
    });

    hits.sort(function(a, b) {
      return (a._distance - b._distance);
    });

    hits.forEach(function(hit) {
      delete hit._distance;
    });

    if (hits.length > 0) {
      hits = [hits[0]];
    }
    return hits;
  }

  return Ray;
});