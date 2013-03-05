//Untility class binding Geometry data, Material style used for rendering and
//3d transforms in one place.

//## Example use
//     var material = new Materials.TestMaterial();
//     var camera = new PerspectiveCamera();
//
//     var cube = new Mesh(new Cube(), material);
//     cube.position.x = 1;
//     cube.rotation = new Vec4(0, 1, 0, Math.PI/2);
//     cube.draw(camera);

//## Reference
define([
  "pex/core/Context",
  "pex/core/Vbo",
  "pex/core/Vec3",
  "pex/core/Vec4",
  "pex/core/Geometry",
  "pex/util/Log",
  "pex/util/ObjUtils"
  ], function(Context, Vbo, Vec3, Vec4, Geometry, Log, ObjUtils) {

  //### Mesh ( meshData, material, options )
  //`meshData` - *{ Vbo }* or *{ Geometry }*
  //`material` - material to use for rendering *{ Material }*
  //`options` - *{ Object }*
  //
  //Default options:
  //`primitiveType` : GL primitive type *{ Number/Int }* = *TRIANGLES*
  //`useEdges` : favor edges instead of faces? *{ Boolean }* = *false*
  //
  //Default mesh transforms:
  //`position` - *{ Vec3 }*  = (0, 0, 0)
  //`rotation` - *{ Vec4 }* = (0, 1, 0, 0)
  //`scale`  - *{ Vec3 }*  = (1, 1, 1)
  //
  //*Note: If Geometry is used as meshData it will be converted into VBOs.*
  function Mesh(meshData, material, options) {
    this.gl = Context.currentContext.gl;

    var defaults = {
      primitiveType : this.gl.TRIANGLES,
      useEdges : false
    }

    this.options = ObjUtils.mergeObjects(defaults, options);

    this.material = material;
    this.vbos = [];

    if (meshData instanceof Vbo) {
      this.vbos.push(meshData);
    }
    else {
      this.geometry = meshData;
      this.buildVbosFromGeometry();
    }

    this.position = new Vec3(0,0,0);
    this.rotation = new Vec4(0, 1, 0, 0);
    this.scale = new Vec3(1, 1, 1);
  }

  //### buildVbosFromGeometry ( )
  //Converts geometry into VBO.
  //The geometry might be split into smaller once if required resulting in many VBOs.
  Mesh.prototype.buildVbosFromGeometry = function() {
    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].dispose();
    }
    this.vbos = [];

    var numVertices = this.geometry.vertices.length;

    if (numVertices > Geometry.MAX_VERTICES) {
      Log.message("Mesh.Mesh numVertices " + numVertices + " > " + Geometry.MAX_VERTICES + ". Splitting...");
      var geometries = this.geometry.split();
      for(var i=0; i<geometries.length; i++) {
        this.vbos.push(Vbo.fromGeometry(geometries[i], this.options.primitiveType, this.options.useEdges));
      }
    }
    else {
      this.vbos.push(Vbo.fromGeometry(this.geometry, this.options.primitiveType, this.options.useEdges));
    }
  }

  //### draw ( camera )
  //Draws the mesh using given camera.
  //`camera` - *{ PerspectiveCamera }*
  //
  //*Note: Camera projection and view matrices will be passed over to shader uniforms.
  //Model View and Normal matrices will be computed and passed as well.*
  Mesh.prototype.draw = function(camera) {

    if (this.geometry && this.geometry.dirty) {
      this.geometry.dirty = false;
      this.buildVbosFromGeometry();
    }

    if (camera) {
      this.material.uniforms.projectionMatrix = camera.getProjectionMatrix();
      this.material.uniforms.viewMatrix = camera.getViewMatrix();
      this.material.uniforms.modelViewMatrix = camera.calcModelViewMatrix(this.position, this.rotation, this.scale);
      this.material.uniforms.modelWorldMatrix = camera.calcModelWorldMatrix(this.position, this.rotation, this.scale);
      this.material.uniforms.normalMatrix = this.material.uniforms.modelViewMatrix.dup().invert().transpose();
    }

    this.material.use();

    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].draw(this.material.program);
    }
  }

  Mesh.prototype.drawInstances = function(camera, instances) {

    if (this.geometry && this.geometry.dirty) {
      this.geometry.dirty = false;
      this.buildVbosFromGeometry();
    }

    if (camera) {
      instances.forEach(function(instance) {
        if (!instance.uniforms) instance.uniforms = {};
        instance.uniforms.projectionMatrix = camera.getProjectionMatrix();
        instance.uniforms.viewMatrix = camera.getViewMatrix();
        instance.uniforms.modelViewMatrix = camera.calcModelViewMatrix(instance.position || this.position,   instance.rotation || this.rotation, instance.scale || this.scale);
        instance.uniforms.modelWorldMatrix = camera.calcModelWorldMatrix(instance.position || this.position, instance.rotation || this.rotation, instance.scale || this.scale);
        instance.uniforms.normalMatrix = instance.uniforms.modelViewMatrix.dup().invert().transpose();
      }.bind(this));
    }

    this.material.use();

    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].drawInstances(this.material.program, instances);
    }
  }

  Mesh.prototype.setMaterial = function(material) {
    this.material = material;
    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].resetAttribLocations();
    }

  }

  //### dispose ( )
  //Frees memory taken by the mesh
  Mesh.prototype.dispose = function() {
    for(var i=0; i<this.vbos.length; i++) {
      this.vbos[i].dispose();
    }
    this.vbos = [];
  }

  return Mesh;
});