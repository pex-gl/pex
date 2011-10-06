define(["pex/core/Context", "pex/core/Vbo", "pex/core/Vec3", "pex/core/Vec4", "pex/geom/Geometry", "pex/util/Util"], function(Context, Vbo, Vec3, Vec4, Geometry, Util) {

  //  Parameters:
  //    gl - gl context
  //    meshData - vbo or geometry
  //    material - mesh material
  //    options = {
  //      primitiveType : eg.: gl.POINTS,
  //      useEdges : true / false
  //    }
  function Mesh(meshData, material, options) {
    this.options = options || {};
    this.gl = Context.currentContext;
    this.material = material;
    this.vbos = [];

    if (meshData instanceof Vbo) {
      this.vbos.push(meshData);
    }
    else {
      this.geometry = meshData;
      if (this.geometry.vertices.length > Geometry.MAX_VERTICES) {
        Util.log("Mesh.Mesh numVertices " + this.geometry.vertices.length + " > " + Geometry.MAX_VERTICES + ". Splitting...");
        var geometries = this.geometry.split();
        for(var i=0; i<geometries.length; i++) {
          this.vbos.push(Vbo.fromGeometry(geometries[i], this.options.primitiveType, this.options.useEdges));
        }
      }
      else {
        this.vbos.push(Vbo.fromGeometry(this.geometry, this.options.primitiveType, this.options.useEdges));
      }
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
    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].draw(this.material.program);
    }
  }

  return Mesh;
});