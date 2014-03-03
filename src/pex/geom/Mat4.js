(function() {
  define(function(require) {
    var Mat4, Vec3;
    Vec3 = require('../geom/Vec3');
    Mat4 = (function() {
      Mat4.count = 0;

      function Mat4() {
        Mat4.count++;
        this.reset();
      }

      Mat4.create = function() {
        return new Mat4();
      };

      Mat4.prototype.equals = function(m, tolerance) {
        if (tolerance == null) {
          tolerance = 0.0000001;
        }
        return (Math.abs(m.a11 - this.a11) <= tolerance) && (Math.abs(m.a12 - this.a12) <= tolerance) && (Math.abs(m.a13 - this.a13) <= tolerance) && (Math.abs(m.a14 - this.a14) <= tolerance) && (Math.abs(m.a21 - this.a21) <= tolerance) && (Math.abs(m.a22 - this.a22) <= tolerance) && (Math.abs(m.a23 - this.a23) <= tolerance) && (Math.abs(m.a24 - this.a24) <= tolerance) && (Math.abs(m.a31 - this.a31) <= tolerance) && (Math.abs(m.a32 - this.a32) <= tolerance) && (Math.abs(m.a33 - this.a33) <= tolerance) && (Math.abs(m.a34 - this.a34) <= tolerance) && (Math.abs(m.a41 - this.a41) <= tolerance) && (Math.abs(m.a42 - this.a42) <= tolerance) && (Math.abs(m.a43 - this.a43) <= tolerance) && (Math.abs(m.a44 - this.a44) <= tolerance);
      };

      Mat4.prototype.hash = function() {
        return this.a11 * 0.01 + this.a12 * 0.02 + this.a13 * 0.03 + this.a14 * 0.04 + this.a21 * 0.05 + this.a22 * 0.06 + this.a23 * 0.07 + this.a24 * 0.08 + this.a31 * 0.09 + this.a32 * 0.10 + this.a33 * 0.11 + this.a34 * 0.12 + this.a41 * 0.13 + this.a42 * 0.14 + this.a43 * 0.15 + this.a44 * 0.16;
      };

      Mat4.prototype.set4x4r = function(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44) {
        this.a11 = a11;
        this.a12 = a12;
        this.a13 = a13;
        this.a14 = a14;
        this.a21 = a21;
        this.a22 = a22;
        this.a23 = a23;
        this.a24 = a24;
        this.a31 = a31;
        this.a32 = a32;
        this.a33 = a33;
        this.a34 = a34;
        this.a41 = a41;
        this.a42 = a42;
        this.a43 = a43;
        this.a44 = a44;
        return this;
      };

      Mat4.prototype.copy = function(m) {
        this.a11 = m.a11;
        this.a12 = m.a12;
        this.a13 = m.a13;
        this.a14 = m.a14;
        this.a21 = m.a21;
        this.a22 = m.a22;
        this.a23 = m.a23;
        this.a24 = m.a24;
        this.a31 = m.a31;
        this.a32 = m.a32;
        this.a33 = m.a33;
        this.a34 = m.a34;
        this.a41 = m.a41;
        this.a42 = m.a42;
        this.a43 = m.a43;
        this.a44 = m.a44;
        return this;
      };

      Mat4.prototype.dup = function() {
        return Mat4.create().copy(this);
      };

      Mat4.prototype.reset = function() {
        this.set4x4r(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this;
      };

      Mat4.prototype.identity = function() {
        this.reset();
        return this;
      };

      Mat4.prototype.mul4x4r = function(b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44) {
        var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
        a11 = this.a11;
        a12 = this.a12;
        a13 = this.a13;
        a14 = this.a14;
        a21 = this.a21;
        a22 = this.a22;
        a23 = this.a23;
        a24 = this.a24;
        a31 = this.a31;
        a32 = this.a32;
        a33 = this.a33;
        a34 = this.a34;
        a41 = this.a41;
        a42 = this.a42;
        a43 = this.a43;
        a44 = this.a44;
        this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return this;
      };

      Mat4.prototype.perspective = function(fovy, aspect, znear, zfar) {
        var f, nf;
        f = 1.0 / Math.tan(fovy / 180 * Math.PI / 2);
        nf = 1.0 / (znear - zfar);
        this.mul4x4r(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zfar + znear) * nf, 2 * znear * zfar * nf, 0, 0, -1, 0);
        return this;
      };

      Mat4.prototype.ortho = function(l, r, b, t, n, f) {
        this.mul4x4r(2 / (r - l), 0, 0, (r + l) / (l - r), 0, 2 / (t - b), 0, (t + b) / (b - t), 0, 0, 2 / (n - f), (f + n) / (n - f), 0, 0, 0, 1);
        return this;
      };

      Mat4.prototype.lookAt = function(eye, target, up) {
        var x, y, z;
        z = (Vec3.create(eye.x - target.x, eye.y - target.y, eye.z - target.z)).normalize();
        x = (Vec3.create(up.x, up.y, up.z)).cross(z).normalize();
        y = Vec3.create().copy(z).cross(x).normalize();
        this.mul4x4r(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);
        this.translate(-eye.x, -eye.y, -eye.z);
        return this;
      };

      Mat4.prototype.translate = function(dx, dy, dz) {
        this.mul4x4r(1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1);
        return this;
      };

      Mat4.prototype.rotate = function(theta, x, y, z) {
        var c, s;
        s = Math.sin(theta);
        c = Math.cos(theta);
        this.mul4x4r(x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, 0, y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, 0, x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c, 0, 0, 0, 0, 1);
        return this;
      };

      Mat4.prototype.asMul = function(a, b) {
        var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44, b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;
        a11 = a.a11;
        a12 = a.a12;
        a13 = a.a13;
        a14 = a.a14;
        a21 = a.a21;
        a22 = a.a22;
        a23 = a.a23;
        a24 = a.a24;
        a31 = a.a31;
        a32 = a.a32;
        a33 = a.a33;
        a34 = a.a34;
        a41 = a.a41;
        a42 = a.a42;
        a43 = a.a43;
        a44 = a.a44;
        b11 = b.a11;
        b12 = b.a12;
        b13 = b.a13;
        b14 = b.a14;
        b21 = b.a21;
        b22 = b.a22;
        b23 = b.a23;
        b24 = b.a24;
        b31 = b.a31;
        b32 = b.a32;
        b33 = b.a33;
        b34 = b.a34;
        b41 = b.a41;
        b42 = b.a42;
        b43 = b.a43;
        b44 = b.a44;
        this.a11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        this.a12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        this.a13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        this.a14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        this.a21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        this.a22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        this.a23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        this.a24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        this.a31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        this.a32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        this.a33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        this.a34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        this.a41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        this.a42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        this.a43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        this.a44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return this;
      };

      Mat4.prototype.mul = function(b) {
        return this.asMul(this, b);
      };

      Mat4.prototype.scale = function(sx, sy, sz) {
        this.mul4x4r(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
        return this;
      };

      Mat4.prototype.invert = function() {
        var a0, a1, a2, a3, a4, a5, b0, b1, b2, b3, b4, b5, invdet, x0, x1, x10, x11, x12, x13, x14, x15, x2, x3, x4, x5, x6, x7, x8, x9;
        x0 = this.a11;
        x1 = this.a12;
        x2 = this.a13;
        x3 = this.a14;
        x4 = this.a21;
        x5 = this.a22;
        x6 = this.a23;
        x7 = this.a24;
        x8 = this.a31;
        x9 = this.a32;
        x10 = this.a33;
        x11 = this.a34;
        x12 = this.a41;
        x13 = this.a42;
        x14 = this.a43;
        x15 = this.a44;
        a0 = x0 * x5 - x1 * x4;
        a1 = x0 * x6 - x2 * x4;
        a2 = x0 * x7 - x3 * x4;
        a3 = x1 * x6 - x2 * x5;
        a4 = x1 * x7 - x3 * x5;
        a5 = x2 * x7 - x3 * x6;
        b0 = x8 * x13 - x9 * x12;
        b1 = x8 * x14 - x10 * x12;
        b2 = x8 * x15 - x11 * x12;
        b3 = x9 * x14 - x10 * x13;
        b4 = x9 * x15 - x11 * x13;
        b5 = x10 * x15 - x11 * x14;
        invdet = 1 / (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
        this.a11 = (+x5 * b5 - x6 * b4 + x7 * b3) * invdet;
        this.a12 = (-x1 * b5 + x2 * b4 - x3 * b3) * invdet;
        this.a13 = (+x13 * a5 - x14 * a4 + x15 * a3) * invdet;
        this.a14 = (-x9 * a5 + x10 * a4 - x11 * a3) * invdet;
        this.a21 = (-x4 * b5 + x6 * b2 - x7 * b1) * invdet;
        this.a22 = (+x0 * b5 - x2 * b2 + x3 * b1) * invdet;
        this.a23 = (-x12 * a5 + x14 * a2 - x15 * a1) * invdet;
        this.a24 = (+x8 * a5 - x10 * a2 + x11 * a1) * invdet;
        this.a31 = (+x4 * b4 - x5 * b2 + x7 * b0) * invdet;
        this.a32 = (-x0 * b4 + x1 * b2 - x3 * b0) * invdet;
        this.a33 = (+x12 * a4 - x13 * a2 + x15 * a0) * invdet;
        this.a34 = (-x8 * a4 + x9 * a2 - x11 * a0) * invdet;
        this.a41 = (-x4 * b3 + x5 * b1 - x6 * b0) * invdet;
        this.a42 = (+x0 * b3 - x1 * b1 + x2 * b0) * invdet;
        this.a43 = (-x12 * a3 + x13 * a1 - x14 * a0) * invdet;
        this.a44 = (+x8 * a3 - x9 * a1 + x10 * a0) * invdet;
        return this;
      };

      Mat4.prototype.transpose = function() {
        var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
        a11 = this.a11;
        a12 = this.a12;
        a13 = this.a13;
        a14 = this.a14;
        a21 = this.a21;
        a22 = this.a22;
        a23 = this.a23;
        a24 = this.a24;
        a31 = this.a31;
        a32 = this.a32;
        a33 = this.a33;
        a34 = this.a34;
        a41 = this.a41;
        a42 = this.a42;
        a43 = this.a43;
        a44 = this.a44;
        this.a11 = a11;
        this.a12 = a21;
        this.a13 = a31;
        this.a14 = a41;
        this.a21 = a12;
        this.a22 = a22;
        this.a23 = a32;
        this.a24 = a42;
        this.a31 = a13;
        this.a32 = a23;
        this.a33 = a33;
        this.a34 = a43;
        this.a41 = a14;
        this.a42 = a24;
        this.a43 = a34;
        this.a44 = a44;
        return this;
      };

      Mat4.prototype.toArray = function() {
        return [this.a11, this.a21, this.a31, this.a41, this.a12, this.a22, this.a32, this.a42, this.a13, this.a23, this.a33, this.a43, this.a14, this.a24, this.a34, this.a44];
      };

      Mat4.prototype.fromArray = function(a) {
        this.a11 = a[0](this.a21 = a[1](this.a31 = a[2](this.a41 = a[3])));
        this.a12 = a[4](this.a22 = a[5](this.a32 = a[6](this.a42 = a[7])));
        this.a13 = a[8](this.a23 = a[9](this.a33 = a[10](this.a43 = a[11])));
        this.a14 = a[12](this.a24 = a[13](this.a34 = a[14](this.a44 = a[15])));
        return this;
      };

      return Mat4;

    })();
    Mat4.count = 0;
    return Mat4;
  });

}).call(this);
