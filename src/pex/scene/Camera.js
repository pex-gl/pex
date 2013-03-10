define(['pex/geom'], function(geom) {
  var Vec2 = geom.Vec2;
  var Vec3 = geom.Vec4;
  var Mat4 = geom.Mat4;

  function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {

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

  PerspectiveCamera.prototype.setPosition = function(position) {
    this.position = position;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getPosition = function() {
    return this.position;
  }

  PerspectiveCamera.prototype.setTarget = function(target) {
    this.target = target;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getTarget = function() {
    return this.target;
  }

  PerspectiveCamera.prototype.setUp = function(up) {
    this.up = up;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getUp = function() {
    return this.up;
  }

  PerspectiveCamera.prototype.lookAt = function(target, eyePosition, up) {
    if (target) this.target = target;
    if (eyePosition) this.position = eyePosition;
    if (up) this.up = up;
    this.updateMatrices();
  }


  PerspectiveCamera.prototype.setNear = function(near) {
    this.near = near;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getNear = function() {
    return this.near;
  }

  PerspectiveCamera.prototype.setFar = function(far) {
    this.far = far;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getFar = function() {
    return this.far;
  }

  PerspectiveCamera.prototype.setFov = function(fov) {
    this.fov = fov;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getFov = function() {
    return this.fov;
  }

  PerspectiveCamera.prototype.setAspectRatio = function(ratio) {
    this.aspectRatio = ratio;
    this.updateMatrices();
  }

  PerspectiveCamera.prototype.getAspectRatio = function() {
    return this.aspectRatio;
  }

  PerspectiveCamera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  PerspectiveCamera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  PerspectiveCamera.prototype.updateMatrices = function() {
    Mat4.perspective(this.projectionMatrix, this.fov / 180 * Math.PI, this.aspectRatio, this.near, this.far);
    Mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  /*
  PerspectiveCamera.prototype.calcModelWorldMatrix = function(modelTranslation, modelRotation, modelScale) {
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

  PerspectiveCamera.prototype.calcModelViewMatrix = function(modelTranslation, modelRotation, modelScale) {
    var modelViewMatrix = this.viewMatrix.dup();
    var modelWorldMatrix = this.calcModelWorldMatrix(modelTranslation, modelRotation, modelScale);
    modelViewMatrix.mul(modelWorldMatrix);
    return modelViewMatrix;
  }

  PerspectiveCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
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

  PerspectiveCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
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

  return PerspectiveCamera;
});