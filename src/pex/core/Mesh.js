define(["pex/core/Vbo", "pex/core/Vec3", "pex/core/Vec4"], function(Vbo, Vec3, Vec4) {
  
  //  Parameters:
  //    gl - gl context
  //    meshData - vbo or geometry
  //    material - mesh material
  //    options = {
  //      primitiveType : eg.: gl.POINTS  
  //  }
  function Mesh(gl, meshData, material, options) {
    this.options = options || {};
    this.gl = gl;
    this.material = material;

    if (meshData instanceof Vbo) {
      this.vbo = meshData;
    }
    else {
      this.geometry = meshData;        
      this.vbo = Vbo.fromGeometry(gl, meshData, this.options.primitiveType);   
    }     

    this.position = new Vec3(0,0,0);
    this.rotation = new Vec4(0, 1, 0, 0);
    this.scale = new Vec3(1, 1, 1);
  }
  
  Mesh.prototype.draw = function(camera) {
    
    if (camera) {          
      this.material.uniforms.projectionMatrix = camera.getProjectionMatrix();
      this.material.uniforms.viewMatrix = camera.getViewMatrix();    
      this.material.uniforms.modelViewMatrix = camera.calcModelViewMatrix(this.position, this.rotation, this.scale);
  	  this.material.uniforms.normalMatrix = this.material.uniforms.modelViewMatrix.dup().invert().transpose();
    }
    
    this.material.use();
    
    this.vbo.draw(this.material.program);
  }
  
  return Mesh;
});