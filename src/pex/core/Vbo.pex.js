Pex.Mesh = function() {   
	this.attribs = [];
	this.position = new PreGL.Vec3(0,0,0);
	this.rotation = new PreGL.Vec4(0,0,0,0);
	this.scale = new PreGL.Vec3(1,1,1); 
}

Pex.Mesh.prototype.addAttrib = function(name, data, size) {
  size = size || 3  
	var attrib = {};
	attrib.name = name;
	attrib.data = data;
	attrib.buffer = gl.createBuffer();  
	attrib.size = size;
  gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	this.attribs.push(attrib);
}    

Pex.Mesh.prototype.updateAttrib = function(name, data) {
  var attrib = null;
  for(var i=0; i<this.attribs.length; i++) {
    if (this.attribs[i].name == name) {
      attrib = this.attribs[i];
      break;
    }
  }
  if (!attrib) {
    return;
  }                                 
  attrib.data = new Float32Array(data);
  gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, attrib.data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}             

Pex.Mesh.prototype.getAttribData = function(name) {
  for(var i=0; i<this.attribs.length; i++) {
    if (this.attribs[i].name == name) {
      return this.attribs[i].data;
    }
  }
  return null;
}

Pex.Mesh.prototype.setIndices = function(data) {  
  if (this.indices === undefined) {
    this.indices = {};    
    this.indices.buffer = gl.createBuffer();
  }                   
  this.indices.data = new Uint16Array(data);     
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
    this.indices.data, gl.STATIC_DRAW
  ); 
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}    

Pex.Mesh.prototype.getIndicesData = function() {
  return this.indices.data;
}                 

Pex.Mesh.prototype.bufferData = function(bufferAttribs, bufferIndices) {  
  if (bufferAttribs) {
    for(var i=0; i<this.attribs.length; i++) {
      var attrib = this.attribs[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
    	gl.bufferData(gl.ARRAY_BUFFER, attrib.data, gl.STATIC_DRAW);
    }                   
  }
 
  if (bufferIndices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
      this.indices.data, gl.STATIC_DRAW
    );               
  }                  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);   
}

Pex.Mesh.prototype.alloc = function(numVertices, numIndices) {
  for(var i=0; i<this.attribs.length; i++) {   
    var attrib = this.attribs[i];
    if (attrib.data.length != numVertices * attrib.size) {
      attrib.data = new Float32Array(numVertices * attrib.size);
    }
  }                                                
  var newNumIndices = numIndices || numVertices;
  if (this.indices.data.length != newNumIndices) {
    this.indices.data = new Uint16Array(newNumIndices);
  }
} 

Pex.Mesh.prototype.draw = function(shader, camera, primitive) {
  primitive = (primitive !== undefined) ? primitive : gl.TRIANGLES; 
  if (camera) {          
    var modelViewMatrix = camera.getModelViewMatrix(this.position, this.rotation, this.scale);
    if (shader.uniforms["modelViewMatrix"]) {			
  	  shader.set("modelViewMatrix", modelViewMatrix);                                           	
	  } 
	  if (shader.uniforms["projectionMatrix"]) {			
  	  shader.set("projectionMatrix", camera.projectionMatrix);                                           	
	  }
  	if (shader.uniforms["normalMatrix"]) {                                                  
  	  var normalMatrix = modelViewMatrix.invert().transpose();
  	  shader.set("normalMatrix", normalMatrix);
  	}
  }                                            
  // else {                    
  //   var modelViewMatrix = new PreGL.Mat4();
  //  modelViewMatrix.translate(this.position.x, this.position.y, this.position.z);
  //  modelViewMatrix.rotate(this.rotation.w, this.rotation.x, this.rotation.y, this.rotation.z);
  //   modelViewMatrix.scale(this.scale.x, this.scale.y, this.scale.z);      
  //   if (shader.uniforms["modelViewMatrix"]) {      
  //    shader.set("modelViewMatrix", modelViewMatrix);                                         
  //    }
  //  if (shader.uniforms["normalMatrix"]) {
  //    var normalMatrix = modelViewMatrix.invert().transpose();
  //    shader.set("normalMatrix", normalMatrix);
  //    }
  // }
           
  if (this.attribs != undefined) { 
    var self = this;                     
    var label = "";
    for(var i in this.attribs) {  
      label += i;
    }       
  }
  for(var i in this.attribs) {         
    var attrib = this.attribs[i];         
    //this should go another way
    //instad of searching for mesh atribs in shader
    //look for required attribs by shader inside mesh
    if (attrib.location === undefined || attrib.location == -1) {
      attrib.location = gl.getAttribLocation(shader.program, attrib.name);      
    }              
    if (attrib.location >= 0) {         
      gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
      gl.vertexAttribPointer(attrib.location, attrib.size, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attrib.location);
    }                      
  }  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
  gl.drawElements(primitive, this.indices.data.length, gl.UNSIGNED_SHORT, 0);          
        
  for(var i in this.attribs) {         
    var attrib = this.attribs[i];
    if (attrib.location >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
      gl.disableVertexAttribArray(attrib.location);
    }                      
  }                                                 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);                   
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
}