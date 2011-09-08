define([], function() {
  
  // |primitiveType| gl.POINTS, gl.TRIANGLES etc..
  // |usage| gl.STATIC_DRAW, gl.STREAM_DRAW or gl.DYNAMIC_DRAW
  // |attributes| an array of objects in the format: [{ data: [], size: 3 }]

  function Vbo(gl, primitiveType, usage, attributes) {
    this.gl = gl;
    this.primitiveType = primitiveType;
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
  
  Vbo.prototype.draw = function(program, camera) {
    if (camera) {          
      var modelViewMatrix = camera.getModelViewMatrix(this.position, this.rotation, this.scale);
      if (program.uniforms.modelViewMatrix) {			
    	  program.uniforms.modelViewMatrix(modelViewMatrix);                                           	
  	  } 
  	  if (program.uniforms.projectionMatrix) {			
    	  program.uniforms.projectionMatrix(camera.projectionMatrix);                                           	
  	  }
    	if (program.uniforms.normalMatrix) {                                                  
    	  var normalMatrix = modelViewMatrix.invert().transpose();
    	  program.uniforms.normalMatrix(normalMatrix);
    	}
    }
        
    for(var name in this.attributes) {         
      var attrib = this.attributes[name];
      //this should go another way
      //instad of searching for mesh atribs in shader
      //look for required attribs by shader inside mesh
      if (attrib.location === undefined || attrib.location == -1) {
        attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);      
        console.log(name + " location is " + attrib.location);
      }              
      if (attrib.location >= 0) {         
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
        this.gl.vertexAttribPointer(attrib.location, attrib.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib.location);
      }                      
    }  
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    this.gl.drawElements(this.primitiveType, this.indices.data.length, this.gl.UNSIGNED_SHORT, 0);          

    /*
    for(var i in this.attribs) {         
      var attrib = this.attribs[i];
      if (attrib.location >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        gl.disableVertexAttribArray(attrib.location);
      }                      
    }                                                 
    gl.bindBuffer(gl.ARRAY_BUFFER, null);                   
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    */
      /*
      for(var name in this.attributes){
          var attr = this.attributes[name];
          if (attr.location >= 0){
              gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
              gl.vertexAttribPointer(attr.location, attr.size, gl.FLOAT, false, 0, 0);
              gl.enableVertexAttribArray(attr.location);
          }
      }
      
      if (this.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
        gl.drawElements(primitive, this.indices.data.length, gl.UNSIGNED_SHORT, 0);
      }
      else {
      //  throw "Vbo.draw error : No index buffer found";
      }
      */
      
      /*
      else {
        if(!this.attributes.index){
            this.length = Number.MAX_VALUE;
            for(var name in this.attributes)
                this.length = Math.min(this.length, this.attributes[name].length);
        }
        gl.drawArrays(this.primitiveType, 0, )
      }
      */
      
      /*     
      var index = this.attributes.index;
      if (index){
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer);
          gl.drawElements(this.primitiveType, index.length, gl.UNSIGNED_SHORT, 0);
      }
      else{
          gl.drawArrays(this.primitiveType, 0, this.length);
      }
      */
  }
  
  Vbo.prototype.dispose = function() {
    for(var name in this.attributes) {
      this.gl.deleteBuffer(this.attributes[name].buffer);
    }
    if (this.indices) {
      this.gl.deleteBuffer(this.indices.buffer);
    }
  }
  
  Vbo.fromGeometry = function(gl, geom) {
    var vbo = new Vbo(gl, gl.TRIANGLES, gl.STATIC_DRAW);
        
    function vectorsToFloats(arr, elementSize) {
      elementSize = elementSize || 3;
      var result = [];
      if (elementSize == 2) {
        for(var i=0; i<arr.length; i++) {
          result.push(arr[i].x, arr[i].y);
        }
      }
      if (elementSize == 3) {
        for(var i=0; i<arr.length; i++) {
          result.push(arr[i].x, arr[i].y, arr[i].z);
        }
      }
      return result;
    }
    
    if (geom.positions) {
      vbo.addAttrib("position", vectorsToFloats(geom.positions), 3);
    }
    if (geom.normals) {
      vbo.addAttrib("normal", vectorsToFloats(geom.normals), 3);
    }
    if (geom.texCoords) {
      vbo.addAttrib("texCoord", vectorsToFloats(geom.texCoord), 2);
    }
    if (geom.indices) {
      vbo.setIndices(geom.indices);
    }
    
    return vbo;
  }
  
  
  return Vbo;
});