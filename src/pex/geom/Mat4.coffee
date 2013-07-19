define (require) ->
  Vec3 = require('../geom/Vec3')

  class Mat4
    constructor: () ->
      @reset()

    @create: () ->
      return new Mat4()

    set4x4r: (a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) ->
      @a11 = a11; @a12 = a12; @a13 = a13; @a14 = a14;
      @a21 = a21; @a22 = a22; @a23 = a23; @a24 = a24;
      @a31 = a31; @a32 = a32; @a33 = a33; @a34 = a34;
      @a41 = a41; @a42 = a42; @a43 = a43; @a44 = a44;
      this

    copy: (m) ->
      @a11 = m.a11; @a12 = m.a12; @a13 = m.a13; @a14 = m.a14;
      @a21 = m.a21; @a22 = m.a22; @a23 = m.a23; @a24 = m.a24;
      @a31 = m.a31; @a32 = m.a32; @a33 = m.a33; @a34 = m.a34;
      @a41 = m.a41; @a42 = m.a42; @a43 = m.a43; @a44 = m.a44;
      this

    reset: () ->
      @set4x4r(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1)
      this

    identity: () ->
      @reset()
      this

    mul4x4r: (b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44) ->
      a11 = @a11; a12 = @a12; a13 = @a13; a14 = @a14
      a21 = @a21; a22 = @a22; a23 = @a23; a24 = @a24
      a31 = @a31; a32 = @a32; a33 = @a33; a34 = @a34
      a41 = @a41; a42 = @a42; a43 = @a43; a44 = @a44

      @a11 = a11*b11 + a12*b21 + a13*b31 + a14*b41
      @a12 = a11*b12 + a12*b22 + a13*b32 + a14*b42
      @a13 = a11*b13 + a12*b23 + a13*b33 + a14*b43
      @a14 = a11*b14 + a12*b24 + a13*b34 + a14*b44
      @a21 = a21*b11 + a22*b21 + a23*b31 + a24*b41
      @a22 = a21*b12 + a22*b22 + a23*b32 + a24*b42
      @a23 = a21*b13 + a22*b23 + a23*b33 + a24*b43
      @a24 = a21*b14 + a22*b24 + a23*b34 + a24*b44
      @a31 = a31*b11 + a32*b21 + a33*b31 + a34*b41
      @a32 = a31*b12 + a32*b22 + a33*b32 + a34*b42
      @a33 = a31*b13 + a32*b23 + a33*b33 + a34*b43
      @a34 = a31*b14 + a32*b24 + a33*b34 + a34*b44
      @a41 = a41*b11 + a42*b21 + a43*b31 + a44*b41
      @a42 = a41*b12 + a42*b22 + a43*b32 + a44*b42
      @a43 = a41*b13 + a42*b23 + a43*b33 + a44*b43
      @a44 = a41*b14 + a42*b24 + a43*b34 + a44*b44

      this

    perspective: (fovy, aspect, znear, zfar) ->
      f = 1.0 / Math.tan(fovy / 180 * Math.PI / 2)
      nf = 1.0 / (znear - zfar)
      @mul4x4r(
          f/aspect, 0,                 0,                 0,
                 0, f,                 0,                 0,
                 0, 0, (zfar+znear) * nf, 2*znear*zfar * nf,
                 0, 0,                -1,                 0)
      this

    lookAt: (eye, target, up) ->
      z = (Vec3.create(eye.x - target.x, eye.y - target.y, eye.z - target.z)).normalize()
      x = (Vec3.create(up.x, up.y, up.z)).cross(z).normalize()
      y = Vec3.create().copy(z).cross(x).normalize()
      @mul4x4r(
        x.x, x.y, x.z, 0,
        y.x, y.y, y.z, 0,
        z.x, z.y, z.z, 0,
        0,   0,   0,   1)
      @translate(-eye.x, -eye.y, -eye.z)
      this

    translate:(dx, dy, dz) ->
      @mul4x4r(1, 0, 0, dx,
               0, 1, 0, dy,
               0, 0, 1, dz,
               0, 0, 0,  1)
      this

    #http://www.cs.rutgers.edu/~decarlo/428/gl_man/rotate.html

    rotate: (theta, x, y, z) ->
      s = Math.sin(theta);
      c = Math.cos(theta);
      @mul4x4r(
        x*x*(1-c)+c  , x*y*(1-c)-z*s, x*z*(1-c)+y*s, 0,
        y*x*(1-c)+z*s,   y*y*(1-c)+c, y*z*(1-c)-x*s, 0,
        x*z*(1-c)-y*s, y*z*(1-c)+x*s,   z*z*(1-c)+c, 0,
                    0,             0,             0, 1
      )
      this

    asMul: (a, b) ->
      a11 = a.a11; a12 = a.a12; a13 = a.a13; a14 = a.a14;
      a21 = a.a21; a22 = a.a22; a23 = a.a23; a24 = a.a24;
      a31 = a.a31; a32 = a.a32; a33 = a.a33; a34 = a.a34;
      a41 = a.a41; a42 = a.a42; a43 = a.a43; a44 = a.a44;
      b11 = b.a11; b12 = b.a12; b13 = b.a13; b14 = b.a14;
      b21 = b.a21; b22 = b.a22; b23 = b.a23; b24 = b.a24;
      b31 = b.a31; b32 = b.a32; b33 = b.a33; b34 = b.a34;
      b41 = b.a41; b42 = b.a42; b43 = b.a43; b44 = b.a44;

      @a11 = a11*b11 + a12*b21 + a13*b31 + a14*b41
      @a12 = a11*b12 + a12*b22 + a13*b32 + a14*b42
      @a13 = a11*b13 + a12*b23 + a13*b33 + a14*b43
      @a14 = a11*b14 + a12*b24 + a13*b34 + a14*b44
      @a21 = a21*b11 + a22*b21 + a23*b31 + a24*b41
      @a22 = a21*b12 + a22*b22 + a23*b32 + a24*b42
      @a23 = a21*b13 + a22*b23 + a23*b33 + a24*b43
      @a24 = a21*b14 + a22*b24 + a23*b34 + a24*b44
      @a31 = a31*b11 + a32*b21 + a33*b31 + a34*b41
      @a32 = a31*b12 + a32*b22 + a33*b32 + a34*b42
      @a33 = a31*b13 + a32*b23 + a33*b33 + a34*b43
      @a34 = a31*b14 + a32*b24 + a33*b34 + a34*b44
      @a41 = a41*b11 + a42*b21 + a43*b31 + a44*b41
      @a42 = a41*b12 + a42*b22 + a43*b32 + a44*b42
      @a43 = a41*b13 + a42*b23 + a43*b33 + a44*b43
      @a44 = a41*b14 + a42*b24 + a43*b34 + a44*b44

      this

    mul: (b) ->
      @asMul(this, b)

    scale: (sx, sy, sz) ->
      @mul4x4r(sx,  0,  0, 0,
              0, sy,  0, 0,
              0,  0, sz, 0,
              0,  0,  0, 1)
      this

    invert: () ->
      # Based on the math at:
      # http://www.geometrictools.com/LibMathematics/Algebra/Wm5Matrix4.inl
      x0 = @a11;  x1 = @a12;  x2 = @a13;  x3 = @a14;
      x4 = @a21;  x5 = @a22;  x6 = @a23;  x7 = @a24;
      x8 = @a31;  x9 = @a32; x10 = @a33; x11 = @a34;
      x12 = @a41; x13 = @a42; x14 = @a43; x15 = @a44;

      a0 =  x0*x5 - x1*x4
      a1 =  x0*x6 - x2*x4
      a2 =  x0*x7 - x3*x4
      a3 =  x1*x6 - x2*x5
      a4 =  x1*x7 - x3*x5
      a5 =  x2*x7 - x3*x6
      b0 =  x8*x13 - x9*x12
      b1 =  x8*x14 - x10*x12
      b2 =  x8*x15 - x11*x12
      b3 =  x9*x14 - x10*x13
      b4 =  x9*x15 - x11*x13
      b5 = x10*x15 - x11*x14

      invdet = 1 / (a0*b5 - a1*b4 + a2*b3 + a3*b2 - a4*b1 + a5*b0)

      @a11 = (+ x5*b5 - x6*b4 + x7*b3) * invdet
      @a12 = (- x1*b5 + x2*b4 - x3*b3) * invdet
      @a13 = (+ x13*a5 - x14*a4 + x15*a3) * invdet
      @a14 = (- x9*a5 + x10*a4 - x11*a3) * invdet
      @a21 = (- x4*b5 + x6*b2 - x7*b1) * invdet
      @a22 = (+ x0*b5 - x2*b2 + x3*b1) * invdet
      @a23 = (- x12*a5 + x14*a2 - x15*a1) * invdet
      @a24 = (+ x8*a5 - x10*a2 + x11*a1) * invdet
      @a31 = (+ x4*b4 - x5*b2 + x7*b0) * invdet
      @a32 = (- x0*b4 + x1*b2 - x3*b0) * invdet
      @a33 = (+ x12*a4 - x13*a2 + x15*a0) * invdet
      @a34 = (- x8*a4 + x9*a2 - x11*a0) * invdet
      @a41 = (- x4*b3 + x5*b1 - x6*b0) * invdet
      @a42 = (+ x0*b3 - x1*b1 + x2*b0) * invdet
      @a43 = (- x12*a3 + x13*a1 - x14*a0) * invdet
      @a44 = (+ x8*a3 - x9*a1 + x10*a0) * invdet

      this

    transpose: () ->
      a11 = @a11; a12 = @a12; a13 = @a13; a14 = @a14;
      a21 = @a21; a22 = @a22; a23 = @a23; a24 = @a24;
      a31 = @a31; a32 = @a32; a33 = @a33; a34 = @a34;
      a41 = @a41; a42 = @a42; a43 = @a43; a44 = @a44;

      @a11 = a11; @a12 = a21; @a13 = a31; @a14 = a41;
      @a21 = a12; @a22 = a22; @a23 = a32; @a24 = a42;
      @a31 = a13; @a32 = a23; @a33 = a33; @a34 = a43;
      @a41 = a14; @a42 = a24; @a43 = a34; @a44 = a44;

      this

    toArray: () ->
      [@a11, @a21, @a31, @a41,
       @a12, @a22, @a32, @a42,
       @a13, @a23, @a33, @a43,
       @a14, @a24, @a34, @a44]

  Mat4.count = 0
  Mat4