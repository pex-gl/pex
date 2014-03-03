(function() {
  define(function(require) {
    var Buffer, Color, Context, Edge, Face3, Face4, FacePolygon, Vec2, Vec3, Vec4, _ref;
    Context = require('pex/gl/Context');
    _ref = require('pex/geom'), Vec2 = _ref.Vec2, Vec3 = _ref.Vec3, Vec4 = _ref.Vec4, Edge = _ref.Edge, Face3 = _ref.Face3, Face4 = _ref.Face4, FacePolygon = _ref.FacePolygon;
    Color = require('pex/color').Color;
    return Buffer = (function() {
      function Buffer(target, type, data, usage) {
        this.gl = Context.currentContext.gl;
        this.target = target;
        this.type = type;
        this.usage = usage || gl.STATIC_DRAW;
        this.dataBuf = null;
        if (data) {
          this.update(data, this.usage);
        }
      }

      Buffer.prototype.dispose = function() {
        this.gl.deleteBuffer(this.handle);
        return this.handle = null;
      };

      Buffer.prototype.update = function(data, usage) {
        var e, face, i, index, numIndices, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _p;
        if (!this.handle) {
          this.handle = this.gl.createBuffer();
        }
        this.usage = usage || this.usage;
        if (!data || data.length === 0) {
          return;
        }
        if (!isNaN(data[0])) {
          if (!this.dataBuf || this.dataBuf.length !== data.length) {
            this.dataBuf = new this.type(data.length);
          }
          for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
            v = data[i];
            this.dataBuf[i] = v;
            this.elementSize = 1;
          }
        } else if (data[0] instanceof Vec2) {
          if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
            this.dataBuf = new this.type(data.length * 2);
            this.elementSize = 2;
          }
          for (i = _j = 0, _len1 = data.length; _j < _len1; i = ++_j) {
            v = data[i];
            this.dataBuf[i * 2 + 0] = v.x;
            this.dataBuf[i * 2 + 1] = v.y;
          }
        } else if (data[0] instanceof Vec3) {
          if (!this.dataBuf || this.dataBuf.length !== data.length * 3) {
            this.dataBuf = new this.type(data.length * 3);
            this.elementSize = 3;
          }
          for (i = _k = 0, _len2 = data.length; _k < _len2; i = ++_k) {
            v = data[i];
            this.dataBuf[i * 3 + 0] = v.x;
            this.dataBuf[i * 3 + 1] = v.y;
            this.dataBuf[i * 3 + 2] = v.z;
          }
        } else if (data[0] instanceof Vec4) {
          if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
            this.dataBuf = new this.type(data.length * 4);
            this.elementSize = 4;
          }
          for (i = _l = 0, _len3 = data.length; _l < _len3; i = ++_l) {
            v = data[i];
            this.dataBuf[i * 4 + 0] = v.x;
            this.dataBuf[i * 4 + 1] = v.y;
            this.dataBuf[i * 4 + 2] = v.z;
            this.dataBuf[i * 4 + 3] = v.w;
          }
        } else if (data[0] instanceof Color) {
          if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
            this.dataBuf = new this.type(data.length * 4);
            this.elementSize = 4;
          }
          for (i = _m = 0, _len4 = data.length; _m < _len4; i = ++_m) {
            v = data[i];
            this.dataBuf[i * 4 + 0] = v.r;
            this.dataBuf[i * 4 + 1] = v.g;
            this.dataBuf[i * 4 + 2] = v.b;
            this.dataBuf[i * 4 + 3] = v.a;
          }
        } else if (data[0] instanceof Edge) {
          if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
            this.dataBuf = new this.type(data.length * 2);
            this.elementSize = 1;
          }
          for (i = _n = 0, _len5 = data.length; _n < _len5; i = ++_n) {
            e = data[i];
            this.dataBuf[i * 2 + 0] = e.a;
            this.dataBuf[i * 2 + 1] = e.b;
          }
        } else if ((data[0] instanceof Face3) || (data[0] instanceof Face4) || (data[0] instanceof FacePolygon)) {
          numIndices = 0;
          for (_o = 0, _len6 = data.length; _o < _len6; _o++) {
            face = data[_o];
            if (face instanceof Face3) {
              numIndices += 3;
            }
            if (face instanceof Face4) {
              numIndices += 6;
            }
            if (face instanceof FacePolygon) {
              throw 'FacePolygons are not supported in RenderableGeometry Buffers';
            }
          }
          if (!this.dataBuf || this.dataBuf.length !== numIndices) {
            this.dataBuf = new this.type(numIndices);
            this.elementSize = 1;
          }
          index = 0;
          for (_p = 0, _len7 = data.length; _p < _len7; _p++) {
            face = data[_p];
            if (face instanceof Face3) {
              this.dataBuf[index + 0] = face.a;
              this.dataBuf[index + 1] = face.b;
              this.dataBuf[index + 2] = face.c;
              index += 3;
            }
            if (face instanceof Face4) {
              this.dataBuf[index + 0] = face.a;
              this.dataBuf[index + 1] = face.b;
              this.dataBuf[index + 2] = face.d;
              this.dataBuf[index + 3] = face.d;
              this.dataBuf[index + 4] = face.b;
              this.dataBuf[index + 5] = face.c;
              index += 6;
            }
          }
        } else {
          console.log('Buffer.unknown type', data.name, data[0]);
        }
        this.gl.bindBuffer(this.target, this.handle);
        return this.gl.bufferData(this.target, this.dataBuf, this.usage);
      };

      return Buffer;

    })();
  });

}).call(this);
