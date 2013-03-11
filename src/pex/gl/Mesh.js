define(['pex/gl/Context', 'pex/geom/Vec3', 'pex/geom/Quat', 'pex/geom/Mat4', 'pex/geom/Face3', 'pex/geom/Face4'],
function(Context, Vec3, Quat, Mat4, Face3, Face4) {
  function Mesh(geometry, material) {
    this.gl = Context.currentContext.gl;
    this.geometry = geometry;
    this.material = material;

    this.gl = Context.currentContext.gl;
    //this.primitiveType = (primitiveType !== undefined) ? primitiveType : this.gl.TRIANGLES;
    this.primitiveType = this.gl.TRIANGLES;
    this.attributes = {};
    this.usage = this.gl.STATIC_DRAW;

    this.addAttrib('position', geometry.attribs.position.data.buf, 3);
    this.addAttrib('normal', geometry.attribs.normal.data.buf, 3);
    this.addAttrib('texCoord', geometry.attribs.texCoord.data.buf, 2);

    this.position = Vec3.fromValues(0, 0, 0);
    this.rotation = Quat.create();
    this.scale = Vec3.fromValues(1, 1, 1);
    this.modelWorldMatrix = Mat4.create();
    this.modelViewMatrix = Mat4.create();
    this.rotationMatrix = Mat4.create();

    this.updateIndices(geometry);
  }

  Mesh.prototype.updateMatrices = function(camera) {
    Mat4.fromQuat(this.rotationMatrix, this.rotation);

    Mat4.identity(this.modelWorldMatrix);
    Mat4.translate(this.modelWorldMatrix, this.modelWorldMatrix, this.position);
    Mat4.mul(this.modelWorldMatrix, this.modelWorldMatrix, this.rotationMatrix);
    Mat4.scale(this.modelWorldMatrix, this.modelWorldMatrix, this.scale);

    Mat4.copy(this.modelViewMatrix, camera.getViewMatrix());
    Mat4.mul(this.modelViewMatrix, this.modelViewMatrix, this.modelWorldMatrix);
  }

  Mesh.prototype.updateIndices = function(geometry) {
    if (this.indices === undefined) {
      this.indices = {};
      this.indices.buffer = this.gl.createBuffer();
    }
    var data = [];
    geometry.faces.forEach(function(face) {
      if (face instanceof Face4) {
        data.push(face.a);
        data.push(face.b);
        data.push(face.d);
        data.push(face.d);
        data.push(face.b);
        data.push(face.c);
      }
      if (face instanceof Face3) {
        data.push(face.a);
        data.push(face.b);
        data.push(face.c);
      }
    });
    this.indices.data = new Uint16Array(data);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.data, this.usage);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  Mesh.prototype.addAttrib = function(name, data, elementSize, usage) {
    elementSize = elementSize || 3
    usage = usage || this.usage;

    var attrib = {};
    attrib.name = name;
    attrib.data = data;
    attrib.elementSize = elementSize;
    attrib.location = -1;
    attrib.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib.data, usage);

    this.attributes[attrib.name] = attrib;
  }

  Mesh.prototype.draw = function(camera) {
    var programUniforms = this.material.program.uniforms;
    var materialUniforms = this.material.uniforms;
    if (camera) {
      this.updateMatrices(camera);
      if (programUniforms.projectionMatrix) {
        materialUniforms.projectionMatrix = camera.getProjectionMatrix();
      }
      //if (programUniforms.viewMatrix)
      //  materialUniforms.viewMatrix = camera.getViewMatrix();
      if (programUniforms.modelViewMatrix) {
        materialUniforms.modelViewMatrix = this.modelViewMatrix;
      }
      //if (programUniforms.modelWorldMatrix)
      //  materialUniforms.modelWorldMatrix = this.modelWorldMatrix;
      //if (programUniforms.normalMatrix)
      //  materialUniforms.normalMatrix = this.material.uniforms.modelViewMatrix.dup().invert().transpose();
    }

    this.material.use();

    var program = this.material.program;
    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      /*
      TODO:this should go another way
      instad of searching for mesh atribs in shader
      look for required attribs by shader inside mesh
      */
      if (attrib.location === undefined || attrib.location == -1) {
        attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
      }
      if (attrib.location >= 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
        this.gl.vertexAttribPointer(attrib.location, attrib.elementSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib.location);
      }
    }

    //return;

    if (this.indices) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
      this.gl.drawElements(this.primitiveType, this.indices.data.length, this.gl.UNSIGNED_SHORT, 0);
    }
    else if (this.attributes['position']){
      var num = this.attributes['position'].data.length/3;
      this.gl.drawArrays(this.primitiveType, 0, num);
    }

    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      if (attrib.location >= 0) {
        this.gl.disableVertexAttribArray(attrib.location);
      }
    }
  }

  return Mesh;
});