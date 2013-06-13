define (require) ->
  kEpsilon = Math.pow(2, -24);

  class Quat
    constructor: (@x=0, @y=0, @z=0, @w=1) ->

    @create: (x, y, z, w) ->
      new Quat(x, y, z, w)

    identity: () ->
      @set(0, 0, 0, 1)
      this

    setAxisAngle: (v, a) ->
      a = a * 0.5
      s = Math.sin( a / 180 * Math.PI )
      @x = s * v.x
      @y = s * v.y
      @z = s * v.z
      @w = Math.cos( a / 180 * Math.PI)
      this

    clone: () ->
      new Quat(@x, @y, @z, @w)

    copy: (q) ->
      @x = q.x
      @y = q.y
      @z = q.z
      @w = q.w
      this

    set: (x, y, z, w) ->
      @x = x
      @y = y
      @z = z
      @w = w
      this

    asMul: (p, q) ->
      px = p.x; py = p.y; pz = p.z; pw = p.w;
      qx = q.x; qy = q.y; qz = q.z; qw = q.w;

      @x  = px * qw + pw * qx + py * qz - pz * qy
      @y  = py * qw + pw * qy + pz * qx - px * qz
      @z  = pz * qw + pw * qz + px * qy - py * qx
      @w  = pw * qw - px * qx - py * qy - pz * qz

      this

    mul: (q) ->
      @mul2(this, q)
      this

    mul4: (x, y, z, w) ->
      ax = @x; ay = @y; az = @z; aw = @w;

      @x = w*ax + x*aw + y*az - z*ay;
      @y = w*ay + y*aw + z*ax - x*az;
      @z = w*az + z*aw + x*ay - y*ax;
      @w = w*aw - x*ax - y*ay - z*az;
      this

    length: () ->
      return Math.sqrt(@x*@x + @y*@y + @z*@z + @w*@w)

    normalize: () ->
      len = @length()

      if len > kEpsilon
        this.x /= len
        this.y /= len
        this.z /= len
        this.w /= len
      this

    toMat4: (out) ->
      xs = @x + @x
      ys = @y + @y
      zs = @z + @z
      wx = @w * xs
      wy = @w * ys
      wz = @w * zs
      xx = @x * xs
      xy = @x * ys
      xz = @x * zs
      yy = @y * ys
      yz = @y * zs
      zz = @z * zs

      m = out || new Mat4()

      return m.set4x4r(
          1 - (yy+zz), xy - wz,      xz + wy,     0,
          xy + wz,     1 - (xx+zz ), yz - wx,     0,
          xz - wy,     yz + wx,      1 - (xx+yy), 0,
          0,           0,            0,           1
      )


###
Quat ( x, y, z, w )
  //Builds a quaternion representing rotation around an axis
  //`x, y, z` - axis vector *{ Number }*
  //`w` - rotation (in radians) *{ Number }*
  function Quat(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }

  Quat.identity = function(){
      return new Quat(0, 0, 0, 1);
  }

  Quat.prototype.set = function(x, y, z, w) {
    this.x = x; this.y = y; this.z = z; this.w = w;
    return this;
  };

  Quat.prototype.setQuat = function(q) {
    this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w;
    return this;
  };

  Quat.prototype.reset = function(){
    return this.set(0, 0, 0, 1);
  };

  Quat.prototype.length = function(){
    var x = this.x, y = this.y, z = this.z, w = this.w;
    return Math.sqrt(x*x + y*y + z*z + w*w);
  }

  Quat.prototype.dot = function(b){
    return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
  }

  Quat.prototype.mul2 = function(a, b){
    var ax = a.x, ay = a.y, az = a.z, aw = a.w
    ,   bx = b.x, by = b.y, bz = b.z, bw = b.w;

    this.x  = bw * ax + bx * aw + ay * bz - by * az;
    this.y  = bw * ay + by * aw + az * bx - bz * ax;
    this.z  = bw * az + bz * aw + ax * by - bx * ay;
    this.w  = bw * aw - bx * ax - ay * by - bz * az;


    return this;
  }

  Quat.prototype.mul = function(q){
    return this.mul2(this, q);
  }

  Quat.prototype.mulled = function(q){
    return this.dup().mul2(this, q);
  }

  Quat.prototype.mul4 = function(x, y, z, w){
    var ax = this.x, ay = this.y, az = this.z, aw = this.w;

    this.x = w*ax + x*aw + y*az - z*ay;
    this.y = w*ay + y*aw + z*ax - x*az;
    this.z = w*az + z*aw + x*ay - y*ax;
    this.w = w*aw - x*ax - y*ay - z*az;

    return this;
  }

  

  Quat.prototype.rotate = function(x, y, z, theta){
    var len = Math.sqrt(x*x + y*y + z*z)

    if(len > kEpsilon){
        var t2  = theta / 2
        ,   st2 = Math.sin(t2);
        this.mul4((x / len) * st2,
                  (y / len) * st2,
                  (z / len) * st2,
                  Math.cos(t2));
    }

    return this;
  }

  Quat.prototype.mulVec3 = function(v) {

        var x = v.x, y = v.y, z = v.z;
        var qx = this.x, qy = this.y, qz = this.z, qw = this.w;

            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        var dest = v.dup();
        dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return dest;

  }

  Quat.prototype.toMat4 = function(){
    var xs = this.x + this.x
    ,   ys = this.y + this.y
    ,   zs = this.z + this.z
    ,   wx = this.w * xs
    ,   wy = this.w * ys
    ,   wz = this.w * zs
    ,   xx = this.x * xs
    ,   xy = this.x * ys
    ,   xz = this.x * zs
    ,   yy = this.y * ys
    ,   yz = this.y * zs
    ,   zz = this.z * zs;

    return new Mat4().set4x4r(
        1 - (yy+zz), xy - wz,      xz + wy,     0,
        xy + wz,     1 - (xx+zz ), yz - wx,     0,
        xz - wy,     yz + wx,      1 - (xx+yy), 0,
        0,           0,            0,           1
    );

//    return new Mat4().set4x4r(
//        1 - (yy+zz), xy + wz,      xz - wy,     0,
//        xy - wz,     1 - (xx+zz ), yz + wx,     0,
//        xz + wy,     yz - wx,      1 - (xx+yy), 0,
//        0,           0,            0,           1
//    );
  }

  Quat.prototype.dup = function(){
    return new Quat(this.x, this.y, this.z, this.w);
  }

  Quat.fromRotationAxis = function(a, x, y, z) {
    return Quat.identity().rotate(x, y, z, a);
  }

  ###