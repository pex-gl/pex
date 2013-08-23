define (require) ->
  { Vec2, Vec3, Vec4, Mat4, Ray } = require('pex/geom')

  class PerspectiveCamera
    constructor: (l, r, b, t, near, far, position, target, up) ->
      @left = l
      @right = r
      @bottom = b
      @top = t
      @near = near || 0.1
      @far = far || 100
      @position = position || Vec3.create(0, 0, 5)
      @target = target || Vec3.create(0, 0, 0)
      @up = up || Vec3.create(0, 1, 0)
      @projectionMatrix = Mat4.create()
      @viewMatrix = Mat4.create()
      @updateMatrices()

    getFov: () -> @fov

    getAspectRatio: () -> @aspectRatio

    getNear: () -> @near

    getFar: () -> @far

    getPosition: () -> @position

    getTarget: () -> @target

    getUp: () -> @up

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
      @projectionMatrix.identity().ortho(@left, @right, @bottom, @top, @near, @far)
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

    ## getWorldRay (x, y, windowWidth, windowHeight)
    #Gets ray in world coordinates for a x,y screen position
    #
    #`x` - x position *{ Number }*  
    #`y` - y position *{ Number }*  
    #`windowWidth` - width of the window *{ Number }*  
    #`windowHeight` - height of the window *{ Number }*  
    #Returns the ray in world coordinates *{ Vec3 }*
    getWorldRay: (x, y, windowWidth, windowHeight) ->
      x = (x - windowWidth/2) / (windowWidth/2)
      y = -(y - windowHeight/2) / (windowHeight/2)

      hNear = 2 * Math.tan(@getFov() / 180*Math.PI / 2) * @getNear()
      wNear = hNear * @getAspectRatio()

      x *= wNear / 2
      y *= hNear / 2

      vOrigin = new Vec3(0, 0, 0);
      vTarget = new Vec3(x, y, -this.getNear())
      invViewMatrix = @getViewMatrix().dup().invert()

      wOrigin = vOrigin.dup().transformMat4(invViewMatrix)
      wTarget = vTarget.dup().transformMat4(invViewMatrix)
      wDirection = wTarget.dup().sub(wOrigin)

      new Ray(wOrigin, wDirection)
