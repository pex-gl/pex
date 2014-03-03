(function() {
  define(function(require) {
    var Context, IO, Log, Program, kFragmentShaderPrefix, kVertexShaderPrefix;
    Context = require('pex/gl/Context');
    IO = require('pex/sys/IO');
    Log = require('pex/utils/Log');
    kVertexShaderPrefix = '' + '#ifdef GL_ES\n' + 'precision highp float\n' + '#endif\n' + '#define VERT\n';
    kFragmentShaderPrefix = '' + '#ifdef GL_ES\n' + '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' + '  precision highp float\n' + '#else\n' + '  precision mediump float\n' + '#endif\n' + '#endif\n' + '#define FRAG\n';
    return Program = (function() {
      Program.currentProgram = null;

      function Program(vertSrc, fragSrc) {
        this.gl = Context.currentContext.gl;
        this.handle = this.gl.createProgram();
        this.uniforms = {};
        this.attributes = {};
        this.addSources(vertSrc, fragSrc);
        this.ready = false;
        if (this.vertShader && this.fragShader) {
          this.link();
        }
      }

      Program.prototype.addSources = function(vertSrc, fragSrc) {
        if (fragSrc == null) {
          fragSrc = vertSrc;
        }
        if (vertSrc) {
          this.addVertexSource(vertSrc);
        }
        if (fragSrc) {
          return this.addFragmentSource(fragSrc);
        }
      };

      Program.prototype.addVertexSource = function(vertSrc) {
        this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertShader, kVertexShaderPrefix + vertSrc + '\n');
        this.gl.compileShader(this.vertShader);
        if (!this.gl.getShaderParameter(this.vertShader, this.gl.COMPILE_STATUS)) {
          throw this.gl.getShaderInfoLog(this.vertShader);
        }
      };

      Program.prototype.addFragmentSource = function(fragSrc) {
        this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragShader, kFragmentShaderPrefix + fragSrc + '\n');
        this.gl.compileShader(this.fragShader);
        if (!this.gl.getShaderParameter(this.fragShader, this.gl.COMPILE_STATUS)) {
          throw this.gl.getShaderInfoLog(this.fragShader);
        }
      };

      Program.prototype.link = function() {
        var arrayElementName, i, info, j, location, numAttributes, numUniforms, _i, _j, _k, _ref, _ref1, _ref2;
        this.gl.attachShader(this.handle, this.vertShader);
        this.gl.attachShader(this.handle, this.fragShader);
        this.gl.linkProgram(this.handle);
        if (!this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS)) {
          throw this.gl.getProgramInfoLog(handle);
        }
        numUniforms = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_UNIFORMS);
        for (i = _i = 0, _ref = numUniforms - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          info = this.gl.getActiveUniform(this.handle, i);
          if (info.size > 1) {
            for (j = _j = 0, _ref1 = info.size - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
              arrayElementName = info.name.replace(/\[\d+\]/, '[' + j + ']');
              location = this.gl.getUniformLocation(this.handle, arrayElementName);
              this.uniforms[arrayElementName] = Program.makeUniformSetter(this.gl, info.type, location);
            }
          } else {
            location = this.gl.getUniformLocation(this.handle, info.name);
            this.uniforms[info.name] = Program.makeUniformSetter(this.gl, info.type, location);
          }
        }
        numAttributes = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_ATTRIBUTES);
        for (i = _k = 0, _ref2 = numAttributes - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          info = this.gl.getActiveAttrib(this.handle, i);
          location = this.gl.getAttribLocation(this.handle, info.name);
          this.attributes[info.name] = location;
        }
        this.ready = true;
        return this;
      };

      Program.prototype.use = function() {
        if (Program.currentProgram !== this.handle) {
          Program.currentProgram = this.handle;
          return this.gl.useProgram(this.handle);
        }
      };

      Program.prototype.dispose = function() {
        this.gl.deleteShader(this.vertShader);
        this.gl.deleteShader(this.fragShader);
        return this.gl.deleteProgram(this.handle);
      };

      Program.load = function(url, callback, options) {
        var program;
        program = new Program();
        IO.loadTextFile(url, function(source) {
          Log.message("Program.Compiling " + url);
          program.addSources(source);
          program.link();
          if (callback) {
            callback();
          }
          if (options && options.autoreload) {
            return IO.watchTextFile(url, function(source) {
              var e;
              try {
                program.gl.detachShader(program.handle, program.vertShader);
                program.gl.detachShader(program.handle, program.fragShader);
                program.addSources(source);
                return program.link();
              } catch (_error) {
                e = _error;
                Log.message("Program.load : failed to reload " + url);
                return Log.message(e);
              }
            });
          }
        });
        return program;
      };

      Program.makeUniformSetter = function(gl, type, location) {
        var mv, setterFun;
        setterFun = null;
        switch (type) {
          case gl.BOOL:
          case gl.INT:
            setterFun = function(value) {
              return gl.uniform1i(location, value);
            };
            break;
          case gl.SAMPLER_2D:
          case gl.SAMPLER_CUBE:
            setterFun = function(value) {
              return gl.uniform1i(location, value);
            };
            break;
          case gl.FLOAT:
            setterFun = function(value) {
              return gl.uniform1f(location, value);
            };
            break;
          case gl.FLOAT_VEC2:
            setterFun = function(v) {
              return gl.uniform2f(location, v.x, v.y);
            };
            break;
          case gl.FLOAT_VEC3:
            setterFun = function(v) {
              return gl.uniform3f(location, v.x, v.y, v.z);
            };
            break;
          case gl.FLOAT_VEC4:
            setterFun = function(v) {
              if (v.r != null) {
                gl.uniform4f(location, v.r, v.g, v.b, v.a);
              }
              if (v.x != null) {
                return gl.uniform4f(location, v.x, v.y, v.z, v.w);
              }
            };
            break;
          case gl.FLOAT_MAT4:
            mv = new Float32Array(16);
            setterFun = function(m) {
              mv[0] = m.a11;
              mv[1] = m.a21;
              mv[2] = m.a31;
              mv[3] = m.a41;
              mv[4] = m.a12;
              mv[5] = m.a22;
              mv[6] = m.a32;
              mv[7] = m.a42;
              mv[8] = m.a13;
              mv[9] = m.a23;
              mv[10] = m.a33;
              mv[11] = m.a43;
              mv[12] = m.a14;
              mv[13] = m.a24;
              mv[14] = m.a34;
              mv[15] = m.a44;
              return gl.uniformMatrix4fv(location, false, mv);
            };
        }
        if (setterFun) {
          setterFun.type = type;
          return setterFun;
        } else {
          return function() {
            throw "Unknown uniform type: " + type;
          };
        }
      };

      return Program;

    })();
  });

}).call(this);
