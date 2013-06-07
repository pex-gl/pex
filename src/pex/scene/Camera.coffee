define (require) ->
  { Vec2, Vec3, Vec4, Mat4 } = require('pex/geom')

  class Camera
    constructor: (fov, aspectRatio, near, far, position, target, up) ->
      @fov = fov || 60
      @aspectRatio = aspectRatio || 4/3
      @near = near || 0.1
      @far = far || 100
      @position = position || Vec3.create(0, 0, 5)
      @target = target || Vec3.create(0, 0, 0)
      @up = up || Vec3.create(0, 1, 0)
      @projectionMatrix = Mat4.create()
      @viewMatrix = Mat4.create()
      @updateMatrices()

    getFov: () -> @fov

    getAspectRatio: () -> aspectRatio

    getNear: () -> @near

    getFar: () -> @far

    getPosition: () -> @position

    getTarget: () -> @target

    getUp: () -> up

    getViewMatrix: () -> @viewMatrix

    getProjectionMatrix: () -> @projectionMatrix

    setFov: (fov) ->
      @fov = fov
      @updateMatrices()

    setAspectRatio: (ratio) ->
      @aspectRatio = ratio;
      @updateMatrices()

    setFar: (far) ->
      @far = far
      @updateMatrices()

    setNear: (near) ->
      @near = near
      @updateMatrices()

    setPosition: (position) ->
      @position = position
      @updateMatrices()

    setTarget: (target) ->
      @target = target
      @updateMatrices()

    setUp: (up) ->
      @up = up
      @updateMatrices()

    lookAt: (target, eyePosition, up) ->
      @target = target if target
      @position = eyePosition if eyePosition
      @up = up if up
      @updateMatrices()

    updateMatrices: () ->
      @projectionMatrix.identity().perspective(@fov, @aspectRatio, @near, @far)
      @viewMatrix.identity().lookAt(@position, @target, @up)

    projected = Vec4.create()

    getScreenPos: (point, windowWidth, windowHeight) ->
      projected.set(point.x, point.y, point.z, 1.0)

      projected.transformMat4(@viewMatrix)
      projected.transformMat4(@projectionMatrix)

      out = Vec2.create().set(projected.x, projected.y)

      out.x /= projected.w
      out.y /= projected.w
      out.x = out.x * 0.5 + 0.5
      out.y = out.y * 0.5 + 0.5
      out.x *= windowWidth
      out.y *= windowHeight
      out
