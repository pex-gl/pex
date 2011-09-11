define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Face3","pex/core/Face4"], function(Vec2, Vec3, Face3, Face4) {

  // |primitiveType| gl.POINTS, gl.TRIANGLES etc..
  // |usage| gl.STATIC_DRAW, gl.STREAM_DRAW or gl.DYNAMIC_DRAW
  // |attributes| an array of objects in the format: [{ data: [], size: 3 }]

  function Vbo(gl, primitiveType, usage) {
    this.gl = gl;
    this.primitiveType = (primitiveType !== undefined) ? primitiveType : this.gl.TRIANGLES;
    this.attributes = {};
    this.usage = usage || this.gl.STATIC_DRAW;
  }

  Vbo.prototype.addAttrib = function(name, data, size, usage) {
    size = size || 3
    usage = usage || this.usage;

  	var attrib = {};
  	attrib.name = name;
  	attrib.data = data;
  	attrib.size = size;
  	attrib.location = -1;
  	attrib.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
  	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), usage);

  	this.attributes[attrib.name] = attrib;
  }

  Vbo.prototype.setIndices = function(data, usage) {
    usage = usage || this.usage;

    if (this.indices === undefined) {
      this.indices = {};
      this.indices.buffer = this.gl.createBuffer();
    }
    this.indices.data = new Uint16Array(data);
  	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.data, usage);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  Vbo.prototype.draw = function(program) {
    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      //this should go another way
      //instad of searching for mesh atribs in shader
      //look for required attribs by shader inside mesh
      if (attrib.location === undefined || attrib.location == -1) {
        attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
        //console.log(name + " location is " + attrib.location);
      }
      if (attrib.location >= 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
        this.gl.vertexAttribPointer(attrib.location, attrib.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib.location);
      }
    }
    if (this.indices) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
      this.gl.drawElements(this.primitiveType, this.indices.data.length, this.gl.UNSIGNED_SHORT, 0);
    }
    else if (this.attributes["position"]){
      this.gl.drawArrays(this.primitiveType, 0, this.attributes["position"].data.length/3);
    }

  }

  Vbo.prototype.dispose = function() {
    for(var name in this.attributes) {
      this.gl.deleteBuffer(this.attributes[name].buffer);
    }
    if (this.indices) {
      this.gl.deleteBuffer(this.indices.buffer);
    }
  }

  //gl
  //geom
  //primitiveType = e.g.: gl.TRIANGLES
  //useEdges = false/true - use faces or edges
  Vbo.fromGeometry = function(gl, geom, primitiveType, useEdges) {
    var vbo = new Vbo(gl, primitiveType, gl.STATIC_DRAW);

    useEdges = useEdges || false;

    var positions = [];

    for(var i=0; i< geom.vertices.length; ++i) {
      positions.push(geom.vertices[i].x, geom.vertices[i].y, geom.vertices[i].z);
    }

    vbo.addAttrib("position", positions, 3);

    if (geom.texCoords && geom.texCoords.length > 0) {
      var texCoords = [];

      for(var i=0; i< geom.texCoords.length; ++i) {
        for(var j in geom.texCoords[i]) {
          texCoords.push(geom.texCoords[i][j]);
        }
      }
      var size = 1;
      if (geom.texCoords[0] instanceof Vec2) size = 2;
      if (geom.texCoords[0] instanceof Vec3) size = 3;
      vbo.addAttrib("texCoord", texCoords, size);
    }

    if (geom.normals && geom.normals.length > 0) {
      var normals = [];

      for(var i=0; i< geom.normals.length; ++i) {
        normals.push(geom.normals[i].x, geom.normals[i].y, geom.normals[i].z);
      }
      vbo.addAttrib("normal", normals, 3);
    }

    if (geom.colors && geom.colors.length > 0) {
      var colors = [];

      for(var i=0; i< geom.colors.length; ++i) {
        colors.push(geom.colors[i].x, geom.colors[i].y, geom.colors[i].z, geom.colors[i].w);
      }
      vbo.addAttrib("color", colors, 4);
    }

    var indices = [];

    if (useEdges) {
      for(var i=0; i < geom.edges.length; ++i) {
        var edge = geom.edges[i];
        indices.push(edge.a);
        indices.push(edge.b);
      }
    }
    else {
      for(var i=0; i < geom.faces.length; ++i) {
        var face = geom.faces[i];
        if (face instanceof Face4) {
          indices.push(face.a);
          indices.push(face.b);
          indices.push(face.d);
          indices.push(face.d);
          indices.push(face.b);
          indices.push(face.c);
        }
        if (face instanceof Face3) {
          indices.push(face.a);
          indices.push(face.b);
          indices.push(face.c);
        }
      }
    }

    if (indices.length > 0) {
      vbo.setIndices(indices);
    }

    return vbo;
  }

  return Vbo;
});