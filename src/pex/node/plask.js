//Vector and Matrix utilities from [Plask](http://plask.org).
//
//*Note: Normally Plask runs on top of Node.js so to use it in the browser I had to copy all the shared code here.*

define([], function() {

  var kPI  = 3.14159265358979323846264338327950288;
  var kPI2 = 1.57079632679489661923132169163975144;
  var kPI4 = 0.785398163397448309615660845819875721;
  var k2PI = 6.28318530717958647692528676655900576;

  // A class representing a 3 dimensional point and/or vector.  There isn't a
  // good reason to differentiate between the two, and you often want to change
  // how you think about the same set of values.  So there is only "vector".
  //
  // The class is designed without accessors or individual mutators, you should
  // access the x, y, and z values directly on the object.
  //
  // Almost all of the core operations happen in place, writing to the current
  // object.  If you want a copy, you can call dup().  For convenience, many
  // operations have a passed-tense version that returns a new object.  Most
  // methods return this to support chaining.
  function Vec3(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }

  Vec3.prototype.set = function(x, y, z) {
    this.x = x; this.y = y; this.z = z;

    return this;
  };

  Vec3.prototype.setVec3 = function(v) {
    this.x = v.x; this.y = v.y; this.z = v.z;

    return this;
  };

  // Cross product, this = a x b.
  Vec3.prototype.cross2 = function(a, b) {
    var ax = a.x, ay = a.y, az = a.z,
        bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  };

  // Cross product, this = this x b.
  Vec3.prototype.cross = function(b) {
    return this.cross2(this, b);
  };

  // Returns the dot product, this . b.
  Vec3.prototype.dot = function(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  };

  // Add two Vec3s, this = a + b.
  Vec3.prototype.add2 = function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  };

  // Add a Vec3, this = this + b.
  Vec3.prototype.add = function(b) {
    return this.add2(this, b);
  };

  Vec3.prototype.added = function(b) {
    return new Vec3(this.x + b.x,
                    this.y + b.y,
                    this.z + b.z);
  };

  // Subtract two Vec3s, this = a - b.
  Vec3.prototype.sub2 = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  };

  // Subtract another Vec3, this = this - b.
  Vec3.prototype.sub = function(b) {
    return this.sub2(this, b);
  };

  Vec3.prototype.subbed = function(b) {
    return new Vec3(this.x - b.x,
                    this.y - b.y,
                    this.z - b.z);
  };

  // Multiply two Vec3s, this = a * b.
  Vec3.prototype.mul2 = function(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  };

  // Multiply by another Vec3, this = this * b.
  Vec3.prototype.mul = function(b) {
    return this.mul2(this, b);
  };

  Vec3.prototype.mulled = function(b) {
    return new Vec3(this.x * b.x,
                    this.y * b.y,
                    this.z * b.z);
  };

  // Multiply by a scalar.
  Vec3.prototype.scale = function(s) {
    this.x *= s; this.y *= s; this.z *= s;

    return this;
  };

  Vec3.prototype.scaled = function(s) {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  };

  // Interpolate between this and another Vec3 |b|, based on |t|.
  Vec3.prototype.lerp = function(b, t) {
    this.x = this.x + (b.x-this.x)*t;
    this.y = this.y + (b.y-this.y)*t;
    this.z = this.z + (b.z-this.z)*t;

    return this;
  };

  Vec3.prototype.lerped = function(b, t) {
    return new Vec3(this.x + (b.x-this.x)*t,
                    this.y + (b.y-this.y)*t,
                    this.z + (b.z-this.z)*t);
  };

  // Magnitude (length).
  Vec3.prototype.length = function() {
    var x = this.x, y = this.y, z = this.z;
    return Math.sqrt(x*x + y*y + z*z);
  };

  // Magnitude squared.
  Vec3.prototype.lengthSquared = function() {
    var x = this.x, y = this.y, z = this.z;
    return x*x + y*y + z*z;
  };

  // Normalize, scaling so the magnitude is 1.  Invalid for a zero vector.
  Vec3.prototype.normalize = function() {
    return this.scale(1/this.length());
  };

  Vec3.prototype.normalized = function() {
    return this.dup().normalize();
  };

  Vec3.prototype.dup = function() {
    return new Vec3(this.x, this.y, this.z);
  };

  Vec3.prototype.debugString = function() {
    return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z;
  };


  // Like a z-less Vec3, Vec2.
  function Vec2(x, y) {
    this.x = x; this.y = y;
  }

  Vec2.prototype.set = function(x, y) {
    this.x = x; this.y = y

    return this;
  };

  Vec2.prototype.setVec2 = function(v) {
    this.x = v.x; this.y = v.y;

    return this;
  };

  // Returns the dot product, this . b.
  Vec2.prototype.dot = function(b) {
    return this.x * b.x + this.y * b.y;
  };

  // Add two Vec2s, this = a + b.
  Vec2.prototype.add2 = function(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  };

  // Add a Vec2, this = this + b.
  Vec2.prototype.add = function(b) {
    return this.add2(this, b);
  };

  Vec2.prototype.added = function(b) {
    return new Vec2(this.x + b.x,
                    this.y + b.y);
  };

  // Subtract two Vec2s, this = a - b.
  Vec2.prototype.sub2 = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  };

  // Subtract another Vec2, this = this - b.
  Vec2.prototype.sub = function(b) {
    return this.sub2(this, b);
  };

  Vec2.prototype.subbed = function(b) {
    return new Vec2(this.x - b.x,
                    this.y - b.y);
  };

  // Multiply two Vec2s, this = a * b.
  Vec2.prototype.mul2 = function(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;

    return this;
  };

  // Multiply by another Vec2, this = this * b.
  Vec2.prototype.mul = function(b) {
    return this.mul2(this, b);
  };

  Vec2.prototype.mulled = function(b) {
    return new Vec2(this.x * b.x,
                    this.y * b.y);
  };

  // Multiply by a scalar.
  Vec2.prototype.scale = function(s) {
    this.x *= s; this.y *= s;

    return this;
  };

  Vec2.prototype.scaled = function(s) {
    return new Vec2(this.x * s, this.y * s);
  };

  // Interpolate between this and another Vec2 |b|, based on |t|.
  Vec2.prototype.lerp = function(b, t) {
    this.x = this.x + (b.x-this.x)*t;
    this.y = this.y + (b.y-this.y)*t;

    return this;
  };

  Vec2.prototype.lerped = function(b, t) {
    return new Vec2(this.x + (b.x-this.x)*t,
                    this.y + (b.y-this.y)*t);
  };

  // Magnitude (length).
  Vec2.prototype.length = function() {
    var x = this.x, y = this.y;
    return Math.sqrt(x*x + y*y);
  };

  // Magnitude squared.
  Vec2.prototype.lengthSquared = function() {
    var x = this.x, y = this.y;
    return x*x + y*y;
  };

  // Normalize, scaling so the magnitude is 1.  Invalid for a zero vector.
  Vec2.prototype.normalize = function() {
    return this.scale(1/this.length());
  };

  Vec2.prototype.normalized = function() {
    return this.dup().normalize();
  };

  Vec2.prototype.dup = function() {
    return new Vec2(this.x, this.y);
  };

  Vec2.prototype.debugString = function() {
    return 'x: ' + this.x + ' y: ' + this.y;
  };


  // TODO(deanm): Vec4 is currently a skeleton container, it should match the
  // features of Vec3.
  function Vec4(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }

  Vec4.prototype.set = function(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;

    return this;
  };

  Vec4.prototype.setVec4 = function(v) {
    this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w;

    return this;
  };

  Vec4.prototype.dup = function() {
    return new Vec4(this.x, this.y, this.z, this.w);
  };

  Vec4.prototype.toVec3 = function() {
    return new Vec3(this.x, this.y, this.z);
  };


  // This represents an affine 4x4 matrix, using mathematical notation,
  // numbered (starting from 1) as aij, where i is the row and j is the column.
  //   a11 a12 a13 a14
  //   a21 a22 a23 a24
  //   a31 a32 a33 a34
  //   a41 a42 a43 a44
  //
  // Almost all operations are multiplies to the current matrix, and happen
  // in place.  You can use dup() to return a copy.
  //
  // Most operations return this to support chaining.
  //
  // It's common to use toFloat32Array to get a Float32Array in OpenGL (column
  // major) memory ordering.  NOTE: The code tries to be explicit about whether
  // things are row major or column major, but remember that GLSL works in
  // column major ordering, and PreGL generally uses row major ordering.
  function Mat4() {
    this.reset();
  }

  // Set the full 16 elements of the 4x4 matrix, arguments in row major order.
  // The elements are specified in row major order.  TODO(deanm): set4x4c.
  Mat4.prototype.set4x4r = function(a11, a12, a13, a14, a21, a22, a23, a24,
                                    a31, a32, a33, a34, a41, a42, a43, a44) {
    this.a11 = a11; this.a12 = a12; this.a13 = a13; this.a14 = a14;
    this.a21 = a21; this.a22 = a22; this.a23 = a23; this.a24 = a24;
    this.a31 = a31; this.a32 = a32; this.a33 = a33; this.a34 = a34;
    this.a41 = a41; this.a42 = a42; this.a43 = a43; this.a44 = a44;

    return this;
  };

  // Reset the transform to the identity matrix.
  Mat4.prototype.reset = function() {
    this.set4x4r(1, 0, 0, 0,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1);

    return this;
  };

  // Matrix multiply this = a * b
  Mat4.prototype.mul2 = function(a, b) {
    var a11 = a.a11, a12 = a.a12, a13 = a.a13, a14 = a.a14,
        a21 = a.a21, a22 = a.a22, a23 = a.a23, a24 = a.a24,
        a31 = a.a31, a32 = a.a32, a33 = a.a33, a34 = a.a34,
        a41 = a.a41, a42 = a.a42, a43 = a.a43, a44 = a.a44;
    var b11 = b.a11, b12 = b.a12, b13 = b.a13, b14 = b.a14,
        b21 = b.a21, b22 = b.a22, b23 = b.a23, b24 = b.a24,
        b31 = b.a31, b32 = b.a32, b33 = b.a33, b34 = b.a34,
        b41 = b.a41, b42 = b.a42, b43 = b.a43, b44 = b.a44;

    this.a11 = a11*b11 + a12*b21 + a13*b31 + a14*b41;
    this.a12 = a11*b12 + a12*b22 + a13*b32 + a14*b42;
    this.a13 = a11*b13 + a12*b23 + a13*b33 + a14*b43;
    this.a14 = a11*b14 + a12*b24 + a13*b34 + a14*b44;
    this.a21 = a21*b11 + a22*b21 + a23*b31 + a24*b41;
    this.a22 = a21*b12 + a22*b22 + a23*b32 + a24*b42;
    this.a23 = a21*b13 + a22*b23 + a23*b33 + a24*b43;
    this.a24 = a21*b14 + a22*b24 + a23*b34 + a24*b44;
    this.a31 = a31*b11 + a32*b21 + a33*b31 + a34*b41;
    this.a32 = a31*b12 + a32*b22 + a33*b32 + a34*b42;
    this.a33 = a31*b13 + a32*b23 + a33*b33 + a34*b43;
    this.a34 = a31*b14 + a32*b24 + a33*b34 + a34*b44;
    this.a41 = a41*b11 + a42*b21 + a43*b31 + a44*b41;
    this.a42 = a41*b12 + a42*b22 + a43*b32 + a44*b42;
    this.a43 = a41*b13 + a42*b23 + a43*b33 + a44*b43;
    this.a44 = a41*b14 + a42*b24 + a43*b34 + a44*b44;

    return this;
  };

  // Matrix multiply this = this * b
  Mat4.prototype.mul = function(b) {
    return this.mul2(this, b);
  };

  // Multiply the current matrix by 16 elements that would compose a Mat4
  // object, but saving on creating the object.  this = this * b.
  // The elements are specific in row major order.  TODO(deanm): mul4x4c.
  // TODO(deanm): It's a shame to duplicate the multiplication code.
  Mat4.prototype.mul4x4r = function(b11, b12, b13, b14, b21, b22, b23, b24,
                                    b31, b32, b33, b34, b41, b42, b43, b44) {
    var a11 = this.a11, a12 = this.a12, a13 = this.a13, a14 = this.a14,
        a21 = this.a21, a22 = this.a22, a23 = this.a23, a24 = this.a24,
        a31 = this.a31, a32 = this.a32, a33 = this.a33, a34 = this.a34,
        a41 = this.a41, a42 = this.a42, a43 = this.a43, a44 = this.a44;

    this.a11 = a11*b11 + a12*b21 + a13*b31 + a14*b41;
    this.a12 = a11*b12 + a12*b22 + a13*b32 + a14*b42;
    this.a13 = a11*b13 + a12*b23 + a13*b33 + a14*b43;
    this.a14 = a11*b14 + a12*b24 + a13*b34 + a14*b44;
    this.a21 = a21*b11 + a22*b21 + a23*b31 + a24*b41;
    this.a22 = a21*b12 + a22*b22 + a23*b32 + a24*b42;
    this.a23 = a21*b13 + a22*b23 + a23*b33 + a24*b43;
    this.a24 = a21*b14 + a22*b24 + a23*b34 + a24*b44;
    this.a31 = a31*b11 + a32*b21 + a33*b31 + a34*b41;
    this.a32 = a31*b12 + a32*b22 + a33*b32 + a34*b42;
    this.a33 = a31*b13 + a32*b23 + a33*b33 + a34*b43;
    this.a34 = a31*b14 + a32*b24 + a33*b34 + a34*b44;
    this.a41 = a41*b11 + a42*b21 + a43*b31 + a44*b41;
    this.a42 = a41*b12 + a42*b22 + a43*b32 + a44*b42;
    this.a43 = a41*b13 + a42*b23 + a43*b33 + a44*b43;
    this.a44 = a41*b14 + a42*b24 + a43*b34 + a44*b44;

    return this;
  };

  // TODO(deanm): Some sort of mat3x3.  There are two ways you could do it
  // though, just multiplying the 3x3 portions of the 4x4 matrix, or doing a
  // 4x4 multiply with the last row/column implied to be 0, 0, 0, 1.  This
  // keeps true to the original matrix even if it's last row is not 0, 0, 0, 1.

  // IN RADIANS, not in degrees like OpenGL.  Rotate about x, y, z.
  // The caller must supply a x, y, z as a unit vector.
  Mat4.prototype.rotate = function(theta, x, y, z) {
    // http://www.cs.rutgers.edu/~decarlo/428/gl_man/rotate.html
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    this.mul4x4r(
        x*x*(1-c)+c, x*y*(1-c)-z*s, x*z*(1-c)+y*s, 0,
      y*x*(1-c)+z*s,   y*y*(1-c)+c, y*z*(1-c)-x*s, 0,
      x*z*(1-c)-y*s, y*z*(1-c)+x*s,   z*z*(1-c)+c, 0,
                  0,             0,             0, 1);

    return this;
  };

  // Multiply by a translation of x, y, and z.
  Mat4.prototype.translate = function(dx, dy, dz) {
    // TODO(deanm): Special case the multiply since most goes unchanged.
    this.mul4x4r(1, 0, 0, dx,
                 0, 1, 0, dy,
                 0, 0, 1, dz,
                 0, 0, 0,  1);

    return this;
  };

  // Multiply by a scale of x, y, and z.
  Mat4.prototype.scale = function(sx, sy, sz) {
    // TODO(deanm): Special case the multiply since most goes unchanged.
    this.mul4x4r(sx,  0,  0, 0,
                  0, sy,  0, 0,
                  0,  0, sz, 0,
                  0,  0,  0, 1);

    return this;
  };

  // Multiply by a look at matrix, computed from the eye, center, and up points.
  Mat4.prototype.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    var z = (new Vec3(ex - cx, ey - cy, ez - cz)).normalize();
    var x = (new Vec3(ux, uy, uz)).cross(z).normalize();
    var y = z.dup().cross(x).normalize();
    // The new axis basis is formed as row vectors since we are transforming
    // the coordinate system (alias not alibi).
    this.mul4x4r(x.x, x.y, x.z, 0,
                 y.x, y.y, y.z, 0,
                 z.x, z.y, z.z, 0,
                   0,   0,   0, 1);
    this.translate(-ex, -ey, -ez);

    return this;
  };

  // Multiply by a frustum matrix computed from left, right, bottom, top,
  // near, and far.
  Mat4.prototype.frustum = function(l, r, b, t, n, f) {
    this.mul4x4r(
        (n+n)/(r-l),           0, (r+l)/(r-l),             0,
                  0, (n+n)/(t-b), (t+b)/(t-b),             0,
                  0,           0, (f+n)/(n-f), (2*f*n)/(n-f),
                  0,           0,          -1,             0);

    return this;
  };

  // Multiply by a perspective matrix, computed from the field of view, aspect
  // ratio, and the z near and far planes.
  Mat4.prototype.perspective = function(fovy, aspect, znear, zfar) {
    // This could also be done reusing the frustum calculation:
    // var ymax = znear * Math.tan(fovy * kPI / 360.0);
    // var ymin = -ymax;
    //
    // var xmin = ymin * aspect;
    // var xmax = ymax * aspect;
    //
    // return makeFrustumAffine(xmin, xmax, ymin, ymax, znear, zfar);

    var f = 1.0 / Math.tan(fovy * kPI / 360.0);
    this.mul4x4r(
        f/aspect, 0,                         0,                         0,
               0, f,                         0,                         0,
               0, 0, (zfar+znear)/(znear-zfar), 2*znear*zfar/(znear-zfar),
               0, 0,                        -1,                         0);

    return this;
  };

  // Multiply by a orthographic matrix, computed from the clipping planes.
  Mat4.prototype.ortho = function(l, r, b, t, n, f) {
    this.mul4x4r(2/(r-l),        0,        0,  (r+l)/(l-r),
                       0,  2/(t-b),        0,  (t+b)/(b-t),
                       0,        0,  2/(n-f),  (f+n)/(n-f),
                       0,        0,        0,            1);

    return this;
  };

  // Invert the matrix.  The matrix must be invertable.
  Mat4.prototype.invert = function() {
    // Based on the math at:
    //   http://www.geometrictools.com/LibMathematics/Algebra/Wm5Matrix4.inl
    var  x0 = this.a11,  x1 = this.a12,  x2 = this.a13,  x3 = this.a14,
         x4 = this.a21,  x5 = this.a22,  x6 = this.a23,  x7 = this.a24,
         x8 = this.a31,  x9 = this.a32, x10 = this.a33, x11 = this.a34,
        x12 = this.a41, x13 = this.a42, x14 = this.a43, x15 = this.a44;

    var a0 = x0*x5 - x1*x4,
        a1 = x0*x6 - x2*x4,
        a2 = x0*x7 - x3*x4,
        a3 = x1*x6 - x2*x5,
        a4 = x1*x7 - x3*x5,
        a5 = x2*x7 - x3*x6,
        b0 = x8*x13 - x9*x12,
        b1 = x8*x14 - x10*x12,
        b2 = x8*x15 - x11*x12,
        b3 = x9*x14 - x10*x13,
        b4 = x9*x15 - x11*x13,
        b5 = x10*x15 - x11*x14;

    // TODO(deanm): These terms aren't reused, so get rid of the temporaries.
    var invdet = 1 / (a0*b5 - a1*b4 + a2*b3 + a3*b2 - a4*b1 + a5*b0);

    this.a11 = (+ x5*b5 - x6*b4 + x7*b3) * invdet;
    this.a12 = (- x1*b5 + x2*b4 - x3*b3) * invdet;
    this.a13 = (+ x13*a5 - x14*a4 + x15*a3) * invdet;
    this.a14 = (- x9*a5 + x10*a4 - x11*a3) * invdet;
    this.a21 = (- x4*b5 + x6*b2 - x7*b1) * invdet;
    this.a22 = (+ x0*b5 - x2*b2 + x3*b1) * invdet;
    this.a23 = (- x12*a5 + x14*a2 - x15*a1) * invdet;
    this.a24 = (+ x8*a5 - x10*a2 + x11*a1) * invdet;
    this.a31 = (+ x4*b4 - x5*b2 + x7*b0) * invdet;
    this.a32 = (- x0*b4 + x1*b2 - x3*b0) * invdet;
    this.a33 = (+ x12*a4 - x13*a2 + x15*a0) * invdet;
    this.a34 = (- x8*a4 + x9*a2 - x11*a0) * invdet;
    this.a41 = (- x4*b3 + x5*b1 - x6*b0) * invdet;
    this.a42 = (+ x0*b3 - x1*b1 + x2*b0) * invdet;
    this.a43 = (- x12*a3 + x13*a1 - x14*a0) * invdet;
    this.a44 = (+ x8*a3 - x9*a1 + x10*a0) * invdet;

    return this;
  };

  // Transpose the matrix, rows become columns and columns become rows.
  Mat4.prototype.transpose = function() {
    var a11 = this.a11, a12 = this.a12, a13 = this.a13, a14 = this.a14,
        a21 = this.a21, a22 = this.a22, a23 = this.a23, a24 = this.a24,
        a31 = this.a31, a32 = this.a32, a33 = this.a33, a34 = this.a34,
        a41 = this.a41, a42 = this.a42, a43 = this.a43, a44 = this.a44;

    this.a11 = a11; this.a12 = a21; this.a13 = a31; this.a14 = a41;
    this.a21 = a12; this.a22 = a22; this.a23 = a32; this.a24 = a42;
    this.a31 = a13; this.a32 = a23; this.a33 = a33; this.a34 = a43;
    this.a41 = a14; this.a42 = a24; this.a43 = a34; this.a44 = a44;

    return this;
  };

  // Multiply Vec3 |v| by the current matrix, returning a Vec3 of this * v.
  Mat4.prototype.mulVec3 = function(v) {
    var x = v.x, y = v.y, z = v.z;
    return new Vec3(this.a14 + this.a11*x + this.a12*y + this.a13*z,
                    this.a24 + this.a21*x + this.a22*y + this.a23*z,
                    this.a34 + this.a31*x + this.a32*y + this.a33*z);
  };

  // Multiply Vec4 |v| by the current matrix, returning a Vec4 of this * v.
  Mat4.prototype.mulVec4 = function(v) {
    var x = v.x, y = v.y, z = v.z, w = v.w;
    return new Vec4(this.a14*w + this.a11*x + this.a12*y + this.a13*z,
                    this.a24*w + this.a21*x + this.a22*y + this.a23*z,
                    this.a34*w + this.a31*x + this.a32*y + this.a33*z,
                    this.a44*w + this.a41*x + this.a42*y + this.a43*z);
  };

  Mat4.prototype.dup = function() {
    var m = new Mat4();  // TODO(deanm): This could be better.
    m.set4x4r(this.a11, this.a12, this.a13, this.a14,
              this.a21, this.a22, this.a23, this.a24,
              this.a31, this.a32, this.a33, this.a34,
              this.a41, this.a42, this.a43, this.a44);
    return m;
  };

  Mat4.prototype.toFloat32Array = function() {
    return new Float32Array([this.a11, this.a21, this.a31, this.a41,
                             this.a12, this.a22, this.a32, this.a42,
                             this.a13, this.a23, this.a33, this.a43,
                             this.a14, this.a24, this.a34, this.a44]);
  };

  Mat4.prototype.debugString = function() {
    var s = [this.a11, this.a12, this.a13, this.a14,
             this.a21, this.a22, this.a23, this.a24,
             this.a31, this.a32, this.a33, this.a34,
             this.a41, this.a42, this.a43, this.a44];
    var row_lengths = [0, 0, 0, 0];
    for (var i = 0; i < 16; ++i) {
      s[i] += '';  // Stringify.
      var len = s[i].length;
      var row = i & 3;
      if (row_lengths[row] < len)
        row_lengths[row] = len;
    }

    var out = '';
    for (var i = 0; i < 16; ++i) {
      var len = s[i].length;
      var row_len = row_lengths[i & 3];
      var num_spaces = row_len - len;
      while (num_spaces--) out += ' ';
      out += s[i] + ((i & 3) === 3 ? '\n' : '  ');
    }

    return out;
  };

  var requestAnimFrameFps = 60;

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / requestAnimFrameFps);
            };
  })();

  var eventListeners = [];

  function fireEvent(eventType, event) {
    for(var i=0; i<eventListeners.length; i++) {
      if (eventListeners[i].eventType == eventType) {
        eventListeners[i].handler(event);
      }
    }
  }

  function registerEvents(canvas) {
    makeMouseDownHandler(canvas);
    makeMouseUpHandler(canvas);
    makeMouseDraggedHandler(canvas);
    makeMouseMovedHandler(canvas);
    makeScrollWheelHandler(canvas);
    makeKeyDownHandler(canvas);
  }

  function makeMouseDownHandler(canvas) {
    canvas.addEventListener('mousedown', function(e) {
      fireEvent("leftMouseDown", {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeMouseUpHandler(canvas) {
    canvas.addEventListener('mouseup', function(e) {
      fireEvent("leftMouseUp", {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      })
    })
  }

  function makeMouseDraggedHandler(canvas) {
    var down = false;
    var px = 0;
    var py = 0;
    canvas.addEventListener('mousedown', function(e) {
      down = true;
      px = e.offsetX || e.clientX - e.target.offsetLeft;
      py = e.offsetY || e.clientY - e.target.offsetTop;
    });
    canvas.addEventListener('mouseup', function(e) {
      down = false;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (down) {
        var x = e.offsetX || e.clientX - e.target.offsetLeft;
        var y = e.offsetY || e.clientY - e.target.offsetTop;
        fireEvent("mouseDragged", {
          x: x,
          y: y,
          dx: x - px,
          dy: y - py,
          option: e.altKey,
          shift: e.shiftKey,
          control: e.ctrlKey
        });
        px = x;
        py = y;
      }
    })
  }

  function makeMouseMovedHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
      fireEvent("mouseMoved", {
        x: e.offsetX || e.clientX - e.target.offsetLeft,
        y: e.offsetY || e.clientY - e.target.offsetTop,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
    })
  }

  function makeScrollWheelHandler(canvas) {
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
    document.addEventListener(mousewheelevt, function(e) {
      fireEvent("scrollWheel", {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY,
        dy: e.wheelDelta/10 || -e.detail/10,
        option: e.altKey,
        shift: e.shiftKey,
        control: e.ctrlKey
      });
      e.preventDefault();
      return false;
    });
  }


  function makeKeyDownHandler(canvas) {
    var timeout = 0;
    window.addEventListener('keydown', function(e) {
      timeout = setTimeout(function() {
        fireEvent("keyDown", {
          str: "",
          keyCode: e.keyCode
        }, 1);
      })
    })
    window.addEventListener('keypress', function(e) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = 0;
      }
      fireEvent("keyDown", {
        str: String.fromCharCode(e.charCode),
        keyCode: e.keyCode
      });
    })
  }

  function simpleWindow(obj) {
    var canvas = document.createElement('canvas');

    if (obj.settings.fullscreen) {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
      obj.settings.width = window.innerWidth;
      obj.settings.height = window.innerHeight;
    }

    canvas.width = obj.width = obj.settings.width || 800;
    canvas.height = obj.height = obj.settings.height || 600;
    canvas.style.backgroundColor = "#000000";
    document.body.appendChild(canvas);

    registerEvents(canvas);

    if (obj.stencil === undefined) obj.stencil = false;

    var gl = null;
    try {
        gl = canvas.getContext('experimental-webgl', {antialias: true, premultipliedAlpha : true, stencil: obj.settings.stencil});
    }
    catch(err){
        console.error(err);
        return;
    }

    obj.framerate = function(fps) {
      requestAnimFrameFps = fps;
    }

    obj.on = function(eventType, handler) {
      eventListeners.push({eventType:eventType, handler:handler});
    }

    obj.gl = gl;
    obj.init();

    function drawloop() {
      obj.draw();
      requestAnimFrame(drawloop);
    }

    requestAnimFrame(drawloop);
  }

  return {
    Vec2 : Vec2,
    Vec3 : Vec3,
    Vec4 : Vec4,
    Mat4 : Mat4,
    simpleWindow: simpleWindow
  }
});
