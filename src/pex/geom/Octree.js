define(['pex/geom/Vec3'], function(Vec3) {
  //position is bottom left corner of the cell
  function Octree(position, size, accuracy) {
    this.maxDistance = Math.max(size.x, Math.max(size.y, size.z));
    this.accuracy = (typeof(accuracy) !== 'undefined') ? accuracy : this.maxDistance / 1000;
    this.root = new Octree.Cell(this, position, size, 0);
  }

  Octree.fromBoundingBox = function(bbox) {
    return new Octree(bbox.min.clone(), bbox.getSize().clone());
  }

  Octree.MaxLevel = 8;

  //p = {x, y, z}
  Octree.prototype.add = function(p) {
    this.root.add(p);
  }

  //check if the point was already added to the octreee
  Octree.prototype.has = function(p) {
    return this.root.has(p);
  }

  Octree.prototype.findNearestPoint = function(p, options) {
    options = options || {};
    return this.root.findNearestPoint(p, options);
  }

  Octree.Cell = function(tree, position, size, level) {
    this.tree = tree;
    this.position = position;
    this.size = size;
    this.level = level;
    this.points = [];
    this.children = [];
  }

  Octree.Cell.prototype.has = function(p) {
    if (!this.contains(p)) return null;

    if (this.children.length > 0) {
      for(var i=0; i<this.children.length; i++) {
        var duplicate = this.children[i].has(p);
        if (duplicate) {
          return duplicate;
        }
      }
      return null;
    }
    else {
      var minDistSqrt = this.tree.accuracy * this.tree.accuracy;
      for(var i=0; i<this.points.length; i++) {
        var o = this.points[i];
        var distSq = p.squareDistance(o);
        if (distSq <= minDistSqrt) {
          return o;
        }
      }
      return null;
    }
  }

  Octree.Cell.prototype.add = function(p) {
    this.points.push(p);

    if (this.children.length > 0) {
      this.addToChildren(p);
    }
    else {
      if (this.points.length > 1 && this.level < Octree.MaxLevel) {
        this.split();
      }
    }
  }

  Octree.Cell.prototype.addToChildren = function(p) {
    for(var i=0; i<this.children.length; i++) {
      if (this.children[i].contains(p)) {
        this.children[i].add(p);
        break;
      }
    }
  }

  Octree.Cell.prototype.contains = function(p) {
    return p.x >= this.position.x - this.tree.accuracy
        && p.y >= this.position.y - this.tree.accuracy
        && p.z >= this.position.z - this.tree.accuracy
        && p.x <= this.position.x + this.size.x + this.tree.accuracy
        && p.y <= this.position.y + this.size.y + this.tree.accuracy
        && p.z <= this.position.z + this.size.z + this.tree.accuracy;
  }

  // 1 2 3 4
  // 5 6 7 8
  Octree.Cell.prototype.split = function() {
    var x = this.position.x;
    var y = this.position.y;
    var z = this.position.z;
    var w2 = this.size.x/2;
    var h2 = this.size.y/2;
    var d2 = this.size.z/2;

    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z), Vec3.create(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z + d2), Vec3.create( w2, h2, d2), this.level + 1));
    this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z + d2), Vec3.create( w2, h2, d2), this.level + 1));

    for(var i=0; i<this.points.length; i++) {
      this.addToChildren(this.points[i]);
    }
  }

  Octree.Cell.prototype.findNearestPoint = function(p, options) {
    var nearest = null;
    if (this.children.length > 0) {
      for(var i=0; i<this.children.length; i++) {
        var child = this.children[i];
        if (child.points.length > 0 && child.contains(p)) {
          nearest = child.findNearestPoint(p, options);
          if (nearest) break;
        }
      }
    }
    if (!nearest && this.points.length > 0) {
      var minDistSq = this.tree.maxDistance * this.tree.maxDistance;
      for(var i=0; i<this.points.length; i++) {
        var distSq = this.points[i].squareDistance(p);
        if (distSq <= minDistSq) {
          if (distSq == 0 && options.notSelf) continue;
          minDistSq = distSq;
          nearest = this.points[i];
        }
      }
    }
    return nearest;
  }

  return Octree;
});