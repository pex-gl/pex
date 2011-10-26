define(["pex/core/Vec3", "pex/core/Vec4", "pex/core/Mat4"], function(Vec3, Vec4, Mat4) {

  function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {

    this.fov = fov || 60;
    this.aspectRatio = aspectRatio || 4/3;
    this.near = near || 0.1;
    this.far = far || 100;
    this.position = position || new Vec3(0, 0, 5);

    this.target = target || new Vec3(0, 0, 0);
    this.up = up || new Vec3(0, 1, 0);
    this.projectionMatrix = new Mat4();
    this.viewMatrix = new Mat4();
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

  PerspectiveCamera.prototype.updateMatrices = function() {
    this.projectionMatrix.reset();
    this.projectionMatrix.perspective(this.fov, this.aspectRatio, this.near, this.far);
    this.viewMatrix.reset();
    this.viewMatrix.lookAt(
      this.position.x, this.position.y, this.position.z,
      this.target.x, this.target.y, this.target.z,
      this.up.x, this.up.y, this.up.z
    );
  }

  PerspectiveCamera.prototype.getViewMatrix = function() {
    return this.viewMatrix;
  }

  PerspectiveCamera.prototype.getProjectionMatrix = function() {
    return this.projectionMatrix;
  }

  PerspectiveCamera.prototype.calcModelViewMatrix = function(modelTranslation, modelRotation, modelScale) {
    var t = modelTranslation ? modelTranslation : new Vec3(0, 0, 0);
    var r = modelRotation ? modelRotation : new Vec4(0, 1, 0, 0);
    var s = modelScale ? modelScale : new Vec3(1, 1, 1);

    var modelWorldMatrix = new Mat4();
    modelWorldMatrix.translate(t.x, t.y, t.z);
    modelWorldMatrix.rotate(r.w, r.x, r.y, r.z);
    modelWorldMatrix.scale(s.x, s.y, s.z);

    var modelViewMatrix = this.viewMatrix.dup();

    modelViewMatrix.mul(modelWorldMatrix);
    return modelViewMatrix;
  }

  return PerspectiveCamera;
});

/*
//returns array of near and far frustrum corners in view coordinates
//starting from near top left and going forward in clock wise order
Pex.PerspectiveCamera.prototype.getFrustumCorners = function() {
  var hnear = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.near;
  var wnear = hnear * this.aspectRatio;
  var hfar = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.far;
  var wfar = hfar * this.aspectRatio;

  var corners = [];
  corners.push(new PreGL.Vec3(-wnear/2, hnear/2, -this.near)); //0, Near Top Left
  corners.push(new PreGL.Vec3( wnear/2, hnear/2, -this.near)); //1, Near Top Right
  corners.push(new PreGL.Vec3( wnear/2,-hnear/2, -this.near)); //2, Near Bottom Right
  corners.push(new PreGL.Vec3(-wnear/2,-hnear/2, -this.near)); //3, Near Bottom Left
  corners.push(new PreGL.Vec3(-wfar/2, hfar/2, -this.far));    //4, Far Top Left
  corners.push(new PreGL.Vec3( wfar/2, hfar/2, -this.far));    //5, Far Top Right
  corners.push(new PreGL.Vec3( wfar/2,-hfar/2, -this.far));    //6, Far Bottom Right
  corners.push(new PreGL.Vec3(-wfar/2,-hfar/2, -this.far));    //7, Far Bottom Left

  return corners;
}

Pex.PerspectiveCamera.prototype.getScreenPos = function(point, screenWidth, screenHeight) {
  point = new PreGL.Vec4(point.x, point.y, point.z, 1.0);

  var projected = this.projectionMatrix.multVec4(this.viewMatrix.multVec4(point));
  var result = new PreGL.Vec3(projected.x, projected.y, projected.z);
  result.x /= result.z;
  result.y /= -result.z;
  result.x = (result.x * 0.38) + 0.5;
  result.y = (result.y * 0.38) + 0.5;
  result.x *= screenWidth;
  result.y *= screenHeight;
  return result;
}
*/