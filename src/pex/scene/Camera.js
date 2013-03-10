define(['pex/geom'], function(geom) {
  var Vec2 = geom.Vec2;
  var Vec3 = geom.Vec4;
  var Mat4 = geom.Mat4;

  function Camera(fov, aspectRatio, near, far, position, target, up) {

    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4/3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || Vec3.fromValues(0, 0, 5);

    this.target = target || Vec3.fromValues(0, 0, 0);
    this.up = up || Vec3.fromValues(0, 1, 0);
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    this.updateMatrices();
  }

  Camera.prototype.setPosition = function(position) {
    this.position = position;
    this.updateMatrices();
  }

  Camera.prototype.getPosition = function() {
    return this.position;
  }

  Camera.prototype.setTarget = function(target) {
    this.target = target;
    this.updateMatrices();
  }

  Camera.prototype.getTarget = function() {
    return this.target;
  }

  Camera.prototype.setUp = function(up) {
    this.up = up;
    this.updateMatrices();
  }

  Camera.prototype.getUp = function() {
    return this.up;
  }

  Camera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) this.target = target;
    if (eyePosition) this.position = eyePosition;
    if (up) this.up = up;
    this.updateMatrices();
  }


  Camera.prototype.setNear = function(near) {
    this.near = near;
    this.updateMatrices();
  }

  Camera.prototype.getNear = function() {
    return this.near;
  }

  Camera.prototype.setFar = function(far) {
    this.far = far;
    this.updateMatrices();
  }

  Camera.prototype.getFar = function() {
    return this.far;
  }

  Camera.prototype.setFov = function(fov) {
    this.fov = fov;
    this.updateMatrices();
  }

  Camera.prototype.getFov = function() {
    return this.fov;
  }

  Camera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    this.updateMatrices();
  }

  Camera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  }

  Camera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  Camera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  Camera.prototype.updateMatrices = function() {
    Mat4.perspective(this.projectionMatrix, this.fov / 180 * Math.PI, this.aspectRatio, this.near, this.far);
    Mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  /*
  Camera.prototype.calcModelWorldMatrix = function(modelTranslation, modelRotation, modelScale) {
    var t = modelTranslation ? modelTranslation : new Vec3(0, 0, 0);
    var r = modelRotation ? modelRotation : new Vec4(0, 1, 0, 0);
    var s = modelScale ? modelScale : new Vec3(1, 1, 1);

    var modelWorldMatrix = new Mat4();
    modelWorldMatrix.translate(t.x, t.y, t.z);
    if (modelRotation instanceof Quat) {
      modelWorldMatrix.mul(modelRotation.toMat4());
    }
    else {
      modelWorldMatrix.rotate(r.w, r.x, r.y, r.z);
    }
    modelWorldMatrix.scale(s.x, s.y, s.z);

   return modelWorldMatrix;
  }

  Camera.prototype.calcModelViewMatrix = function(modelTranslation, modelRotation, modelScale) {
    var modelViewMatrix = this.viewMatrix.dup();
    var modelWorldMatrix = this.calcModelWorldMatrix(modelTranslation, modelRotation, modelScale);
    modelViewMatrix.mul(modelWorldMatrix);
    return modelViewMatrix;
  }

  Camera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
    var x = (x - windowWidth/2) / (windowWidth/2);
    var y = -(y - windowHeight/2) / (windowHeight/2);

    var hNear = 2 * Math.tan(this.getFov()/180*Math.PI / 2) * this.getNear();
    var wNear = hNear * this.getAspectRatio();

    x *= wNear / 2;
    y *= hNear / 2;

    var vOrigin = new Vec3(0, 0, 0);
    var vTarget = new Vec3(x, y, -this.getNear());
    var invViewMatrix = this.getViewMatrix().dup().invert();

    var wOrigin = invViewMatrix.mulVec3(vOrigin);
    var wTarget = invViewMatrix.mulVec3(vTarget);
    var wDirection = wTarget.subbed(wOrigin);

    return new Ray(wOrigin, wDirection);
  }

  Camera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
    point = new Vec4(point.x, point.y, point.z, 1.0);

    var projected = this.projectionMatrix.mulVec4(this.viewMatrix.mulVec4(point));
    var result = new Vec2(projected.x, projected.y);
    result.x /= projected.w;
    result.y /= projected.w;
    result.x = result.x*0.5 + 0.5;
    result.y = result.y*0.5 + 0.5;
    result.x *= windowWidth;
    result.y *= windowHeight;
    return result;
  }
  */

  return Camera;
});