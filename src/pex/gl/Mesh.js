(function() {
  define(function(require) {
    var BoundingBox, Context, Mat4, Mesh, Quat, RenderableGeometry, Vec3, _ref;
    Context = require('pex/gl/Context');
    _ref = require('pex/geom'), Vec3 = _ref.Vec3, Quat = _ref.Quat, Mat4 = _ref.Mat4, BoundingBox = _ref.BoundingBox;
    RenderableGeometry = require('pex/gl/RenderableGeometry');
    return Mesh = (function() {
      function Mesh(geometry, material, options) {
        this.gl = Context.currentContext.gl;
        this.geometry = geometry;
        this.material = material;
        options = options || {};
        this.primitiveType = options.primitiveType;
        if (this.primitiveType == null) {
          this.primitiveType = this.gl.TRIANGLES;
        }
        if (options.useEdges) {
          this.primitiveType = this.gl.LINES;
        }
        this.useEdges = options.useEdges;
        this.position = Vec3.create(0, 0, 0);
        this.rotation = Quat.create();
        this.scale = Vec3.create(1, 1, 1);
        this.projectionMatrix = Mat4.create();
        this.viewMatrix = Mat4.create();
        this.modelWorldMatrix = Mat4.create();
        this.modelViewMatrix = Mat4.create();
        this.rotationMatrix = Mat4.create();
        this.normalMatrix = Mat4.create();
      }

      Mesh.prototype.draw = function(camera) {
        var num;
        if (this.geometry.isDirty()) {
          this.geometry.compile();
        }
        if (camera) {
          this.updateMatrices(camera);
          this.updateMatricesUniforms(this.material);
        }
        this.material.use();
        this.bindAttribs();
        if (this.geometry.faces && this.geometry.faces.length > 0 && !this.useEdges) {
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
          this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
        } else if (this.geometry.edges && this.useEdges) {
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
          this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
        } else if (this.geometry.vertices) {
          num = this.geometry.vertices.length;
          this.gl.drawArrays(this.primitiveType, 0, num);
        }
        return this.unbindAttribs();
      };

      Mesh.prototype.drawInstances = function(camera, instances) {
        var instance, num, _i, _j, _k, _len, _len1, _len2;
        if (this.geometry.isDirty()) {
          this.geometry.compile();
        }
        this.material.use();
        this.bindAttribs();
        if (this.geometry.faces && this.geometry.faces.length > 0 && !this.useEdges) {
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
          for (_i = 0, _len = instances.length; _i < _len; _i++) {
            instance = instances[_i];
            if (camera) {
              this.updateMatrices(camera, instance);
              this.updateMatricesUniforms(this.material);
              this.updateUniforms(this.material, instance);
              this.material.use();
            }
            this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
          }
        } else if (this.geometry.edges && this.useEdges) {
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
          for (_j = 0, _len1 = instances.length; _j < _len1; _j++) {
            instance = instances[_j];
            if (camera) {
              this.updateMatrices(camera, instance);
              this.updateMatricesUniforms(this.material);
              this.updateUniforms(this.material, instance);
              this.material.use();
            }
            this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
          }
        } else if (this.geometry.vertices) {
          num = this.geometry.vertices.length;
          for (_k = 0, _len2 = instances.length; _k < _len2; _k++) {
            instance = instances[_k];
            if (camera) {
              this.updateMatrices(camera, instance);
              this.updateMatricesUniforms(this.material);
              this.updateUniforms(this.material, instance);
              this.material.use();
            }
            this.gl.drawArrays(this.primitiveType, 0, num);
          }
        }
        return this.unbindAttribs();
      };

      Mesh.prototype.bindAttribs = function() {
        var attrib, name, program, _ref1, _results;
        program = this.material.program;
        _ref1 = this.geometry.attribs;
        _results = [];
        for (name in _ref1) {
          attrib = _ref1[name];
          attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
          if (attrib.location >= 0) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer.handle);
            this.gl.vertexAttribPointer(attrib.location, attrib.buffer.elementSize, this.gl.FLOAT, false, 0, 0);
            _results.push(this.gl.enableVertexAttribArray(attrib.location));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Mesh.prototype.unbindAttribs = function() {
        var attrib, name, _ref1, _results;
        _ref1 = this.geometry.attribs;
        _results = [];
        for (name in _ref1) {
          attrib = _ref1[name];
          if (attrib.location >= 0) {
            _results.push(this.gl.disableVertexAttribArray(attrib.location));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Mesh.prototype.resetAttribLocations = function() {
        var attrib, name, _results;
        _results = [];
        for (name in this.attributes) {
          attrib = this.attributes[name];
          _results.push(attrib.location = -1);
        }
        return _results;
      };

      Mesh.prototype.updateMatrices = function(camera, instance) {
        var position, rotation, scale;
        position = instance && instance.position ? instance.position : this.position;
        rotation = instance && instance.rotation ? instance.rotation : this.rotation;
        scale = instance && instance.scale ? instance.scale : this.scale;
        rotation.toMat4(this.rotationMatrix);
        this.modelWorldMatrix.identity().translate(position.x, position.y, position.z).mul(this.rotationMatrix).scale(scale.x, scale.y, scale.z);
        if (camera) {
          this.projectionMatrix.copy(camera.getProjectionMatrix());
          this.viewMatrix.copy(camera.getViewMatrix());
          this.modelViewMatrix.copy(camera.getViewMatrix()).mul(this.modelWorldMatrix);
          return this.normalMatrix.copy(this.modelViewMatrix).invert().transpose();
        }
      };

      Mesh.prototype.updateUniforms = function(material, instance) {
        var uniformName, uniformValue, _ref1, _results;
        _ref1 = instance.uniforms;
        _results = [];
        for (uniformName in _ref1) {
          uniformValue = _ref1[uniformName];
          _results.push(material.uniforms[uniformName] = uniformValue);
        }
        return _results;
      };

      Mesh.prototype.updateMatricesUniforms = function(material) {
        var materialUniforms, programUniforms;
        programUniforms = this.material.program.uniforms;
        materialUniforms = this.material.uniforms;
        if (programUniforms.projectionMatrix) {
          materialUniforms.projectionMatrix = this.projectionMatrix;
        }
        if (programUniforms.viewMatrix) {
          materialUniforms.viewMatrix = this.viewMatrix;
        }
        if (programUniforms.modelWorldMatrix) {
          materialUniforms.modelWorldMatrix = this.modelWorldMatrix;
        }
        if (programUniforms.modelViewMatrix) {
          materialUniforms.modelViewMatrix = this.modelViewMatrix;
        }
        if (programUniforms.normalMatrix) {
          return materialUniforms.normalMatrix = this.normalMatrix;
        }
      };

      Mesh.prototype.getMaterial = function() {
        return this.material;
      };

      Mesh.prototype.setMaterial = function(material) {
        this.material = material;
        return this.resetAttribLocations();
      };

      Mesh.prototype.getProgram = function() {
        return this.material.program;
      };

      Mesh.prototype.setProgram = function(program) {
        this.material.program = program;
        return this.resetAttribLocations();
      };

      Mesh.prototype.dispose = function() {
        return this.geometry.dispose();
      };

      Mesh.prototype.getBoundingBox = function() {
        if (!this.boundingBox) {
          this.updateBoundingBox();
        }
        return this.boundingBox;
      };

      Mesh.prototype.updateBoundingBox = function() {
        this.updateMatrices();
        return this.boundingBox = BoundingBox.fromPoints(this.geometry.vertices.map((function(_this) {
          return function(v) {
            return v.dup().transformMat4(_this.modelWorldMatrix);
          };
        })(this)));
      };

      return Mesh;

    })();
  });

}).call(this);
