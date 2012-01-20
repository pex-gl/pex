//Vertex Buffer Object.

//## Example use
//     var positions = [ 0,0,0, 0,1,0, 1,1,0 ];
//     var colors = [ 1,0,0,1, 0,1,0,1, 0,0,1,1 ];
//     var indices = [ 0,1,2 ];
//
//     var vbo = new Vbo(gl.TRIANGLES, gl.STATIC_DRAW);
//     vbo.addAttrib("position", positions);
//     vbo.addAttrib("color", colors, 4);
//     vbo.setIndices(indices);
//
//     var program = Program.load("showColor.glsl");
//     vbo.draw(program);

//## Reference
define([
  "pex/core/Context", 
  "pex/core/Vec2", 
  "pex/core/Vec3", 
  "pex/core/Face3",
  "pex/core/Face4"
  ], function(Context, Vec2, Vec3, Face3, Face4) {

  //### Vbo ( primitiveType, usage )
  //`primitiveType` : GL primitive type *{ Number/Int }* = *TRIANGLES*  
  //`usage` : GL buffer usage *{ Number/Int }* = *STATIC_DRAW*  
  function Vbo(primitiveType, usage) {
    this.gl = Context.currentContext.gl;
    this.primitiveType = (primitiveType !== undefined) ? primitiveType : this.gl.TRIANGLES;
    this.attributes = {};
    this.usage = usage || this.gl.STATIC_DRAW;
  }

  //### addAttrib ( name, data, size, usage )
  //Adds vector attribute to the buffer.  
  //
  //`name` - name of the attribute *{ String }*  
  //`data` - attribute data *{ Array of Numbers }*  
  //`size` - number of elements per vertex *{ Number/Int }*  
  //*For example if position is Vec3 then is has 3 elements X, Y, Z per vertex.*    
  //`usage` : GL buffer usage *{ Number/Int }*  
  //*If no usage is specified the default from the Vbo constructor will be used.*
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

  //### updateAttrib ( name, data )
  //Uploads new data for the given attribute to the GPU.  
  //
  //`name` - name of the attribute to update *{ String }*   
  //`data` - new data *{ Array of Numbers }*   
  Vbo.prototype.updateAttrib = function(name, data) {
    var attrib = this.attributes[name];
    if (!attrib) {
      return;
    }

    attrib.data = new Float32Array(data);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib.data, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  //### setIndices ( data, usage )
  //Sets the index buffer data.  
  //
  //`data` - indices data *{ Array of Numbers/Ints }*  
  //`usage` : GL buffer usage *{ Number/Int }*  
  //*If no usage is specified the default from the Vbo constructor will be used.*
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

  //### draw ( program )
  //Binds all the vertex attributes and draws all the primitives.  
  //
  //`program` - shader program to draw with *{ Program }*
  Vbo.prototype.draw = function(program) {    
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
        this.gl.vertexAttribPointer(attrib.location, attrib.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib.location);
      }
    }

    if (this.indices) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
      this.gl.drawElements(this.primitiveType, this.indices.data.length, this.gl.UNSIGNED_SHORT, null);
    }
    else if (this.attributes["position"]){
      this.gl.drawArrays(this.primitiveType, 0, this.attributes["position"].data.length/3);
    }

    for(var name in this.attributes) {
      var attrib = this.attributes[name];
      if (attrib.location >= 0) {
        this.gl.disableVertexAttribArray(attrib.location);
      }
    }
  }

  //### dispose ( )
  //Frees all the buffers data.
  Vbo.prototype.dispose = function() {
    for(var name in this.attributes) {
      this.gl.deleteBuffer(this.attributes[name].buffer);
    }
    if (this.indices) {
      this.gl.deleteBuffer(this.indices.buffer);
    }
  }

  //### fromGeometry ( geom, primitiveType, useEdges )
  //Builds new VBO from geometry data.
  //
  //`geom` - geometry to build from *{ Geometry }*  
  //`primitiveType` : GL primitive type *{ Number/Int }* = *TRIANGLES*  
  //`useEdges` - use edges instead of faces? *{ Boolean }* = *false*
  Vbo.fromGeometry = function(geom, primitiveType, useEdges) {
    var gl = Context.currentContext.gl;;

    var vbo = new Vbo(primitiveType, gl.DYNAMIC_DRAW);

    useEdges = useEdges || false;

    var positions = [];

    for(var i=0; i<geom.vertices.length; ++i) {
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

      for(var i=0; i<geom.colors.length; ++i) {
        colors.push(geom.colors[i].r, geom.colors[i].g, geom.colors[i].b, geom.colors[i].a);
      }
      vbo.addAttrib("color", colors, 4);
    }

    var indices = [];

    if (!useEdges && geom.edges && !geom.faces) {
      useEdges = true;
    }

    if (useEdges && geom.edges) {
      for(var i=0; i < geom.edges.length; ++i) {
        var edge = geom.edges[i];
        indices.push(edge.a);
        indices.push(edge.b);
      }
    }
    else if (geom.faces) {
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