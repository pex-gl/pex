define(["pex/core/Face4", "pex/core/Geometry", "pex/geom/hem/HEMesh", "pex/geom/hem/HEVertex", "pex/geom/hem/HEEdge", "pex/geom/hem/HEFace"], 
function(Face4, Geometry, HEMesh, HEVertex, HEEdge, HEFace) {
  function HEGeometryConverter() {
  }

  HEGeometryConverter.hemeshFromGeometry = function(geom) {
    var hemesh = new HEMesh();
    for(var i=0; i<geom.vertices.length; i++) {
      var v = geom.vertices[i];
      hemesh.vertices.push(new HEVertex(v.x, v.y, v.z));
    }
    
    var indices = ["a", "b", "c", "d"];
    var newEdges = [null, null, null, null];
    var numEdges = 3;
    for(var i=0; i<geom.faces.length; i++) {
      var f = geom.faces[i];
      var newFace = new HEFace();
      hemesh.faces.push(newFace);
            
      if (f instanceof Face4) {
        numEdges = 4;
      }
      
      for(var j=0; j<numEdges; j++) {
        newEdges[j] = new HEEdge();
        hemesh.edges.push(newEdges[j]);        
        var vertexIndex = f[indices[j]];
        newEdges[j].vert = hemesh.vertices[vertexIndex];
        newEdges[j].face = newFace;
      }
      for(var j=0; j<numEdges; j++) {
        newEdges[j].next = newEdges[(j+1) % numEdges];
      }
      
      newFace.edge = newEdges[0];
    }
    
    hemesh.fixDuplicatedVertices()
    hemesh.fixVertexEdges();
    hemesh.fixEdgePairs();
    hemesh.check();
    return hemesh;
  }
  
  HEGeometryConverter.hemeshToFlatGeometry = function(hemesh) {
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.normals = [];

    var idx = 0;
    for(var i in hemesh.faces) {
      var face = hemesh.faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        geometry.vertices.push(faceVertices[0]);
        geometry.vertices.push(faceVertices[1]);
        geometry.vertices.push(faceVertices[2]);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
      }
      else if (faceVertices.length == 4) {
        geometry.vertices.push(faceVertices[0]);
        geometry.vertices.push(faceVertices[1]);
        geometry.vertices.push(faceVertices[3]);
        geometry.vertices.push(faceVertices[3]);
        geometry.vertices.push(faceVertices[1]);
        geometry.vertices.push(faceVertices[2]);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
        geometry.normals.push(faceNormal);
      }
      else {
        throw "HEGeometryConverter.hemeshToFlatGeometry: Unsupported face vertex count:" + faceVertices.length;
      }      
    }
    return geometry;    
  }

  return HEGeometryConverter;
});
