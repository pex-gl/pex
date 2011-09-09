define(["pex/core/Vbo", "pex/core/Vec3", "pex/core/Vec4"], function(Vbo, Vec3, Vec4) {
  
  //options = {
  //  primitiveType : eg.: gl.POINTS  
  //}
  function Mesh(gl, geometry, material, options) {
    this.options = options || {};
    this.gl = gl;
    this.material = material;
    this.geometry = geometry;    
    this.vbo = Vbo.fromGeometry(gl, geometry, this.options.primitiveType); 
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