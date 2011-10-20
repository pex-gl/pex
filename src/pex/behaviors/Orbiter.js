define(["pex/core/Vec3"], function(Vec3) {
  function Orbiter(center, distance, bindTarget, bindProperty) {
    this.center = center;
    this.distance = distance;
    this.bindTarget = bindTarget;
    this.bindProperty = bindProperty;
    this.rotation = 0;
    this.speed = 1;
  }

  Orbiter.prototype.update = function(delta) {
    this.rotation += delta * this.speed;

    var p = new Vec3(Math.cos(this.rotation), 0, Math.sin(this.rotation));
    p.scale(this.distance).add(this.center);

    if (typeof(this.bindTarget[this.bindProperty]) == "function") {
      this.bindTarget[this.bindProperty].call(this.bindTarget, p);
    }
    else {
      this.bindTarget[this.bindProperty] = p;
    }
  }

  return Orbiter;
});