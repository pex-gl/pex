define([
  'pex/geom/Vec3',
  'pex/geom/Face3',
  'pex/geom/Face4',
  'pex/geom/FacePolygon',
  'pex/geom/Geometry',
  'pex/geom/hem/HEMesh',
  'pex/geom/hem/HEVertex',
  'pex/geom/hem/HEEdge',
  'pex/geom/hem/HEFace',
  'pex/geom/Edge',
  'pex/geom/gen/LineBuilder'
],
function(Vec3, Face3, Face4, FacePolygon, Geometry, HEMesh, HEVertex, HEEdge, HEFace, Edge, LineBuilder)  {
  function HEGeometryConverter() {
  }

  HEMesh.prototype.fromGeometry = function(geom) {
    this.vertices.length = 0;
    this.faces.length = 0;
    this.edges.length = 0;

    var positions = geom.attribs.position.data;

    for(var i=0; i<positions.length; i++) {
      var pos = positions[i];
      this.vertices.push(new HEVertex(pos[0], pos[1], pos[2]));
    }

    var indices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    var newEdges = [null, null, null, null, null];
    var numEdges = 3;
    if (geom.faces && geom.faces.length > 0) {
      for(var i=0; i<geom.faces.length; i++) {
        var f = geom.faces[i];
        var newFace = new HEFace();
        this.faces.push(newFace);

        if (f instanceof Face4) {
          numEdges = 4;
        }
        if (f instanceof FacePolygon) {
          numEdges = f.numVertices;
        }

        for(var j=0; j<numEdges; j++) {
          newEdges[j] = new HEEdge();
          this.edges.push(newEdges[j]);
          var vertexIndex = f[indices[j]];
          newEdges[j].vert = this.vertices[vertexIndex];
          newEdges[j].face = newFace;
        }
        for(var k=0; k<numEdges; k++) {
          newEdges[k].next = newEdges[(k+1) % numEdges];
        }

        newFace.edge = newEdges[0];
      }
    }
    else {
      for(var i=0; i<geom.vertices.length; i+=3) {
        var newFace = new HEFace();
        this.faces.push(newFace);
        var numEdges = 3;
        for(var j=0; j<numEdges; j++) {
          newEdges[j] = new HEEdge();
          this.edges.push(newEdges[j]);
          var vertexIndex = i + j;
          newEdges[j].vert = this.vertices[vertexIndex];
          newEdges[j].face = newFace;
        }
        for(var k=0; k<numEdges; k++) {
          newEdges[k].next = newEdges[(k+1) % numEdges];
        }
        newFace.edge = newEdges[0];
      }
    }

    this.fixDuplicatedVertices();
    this.fixDuplicatedEdges();
    this.fixVertexEdges();
    this.fixEdgePairs();
    this.check();
    return this;
  };

  HEMesh.prototype.toFlatGeometry = function(selectedOnly) {
    selectedOnly = (typeof(selectedOnly) === 'undefined') ? false : selectedOnly;
    var numVerties = 0;
    var faces = this.faces;
    if (selectedOnly) {
      faces = this.getSelectedFaces();
    }

    faces.forEach(function(f) {
      var faceVertexCount = f.getAllVertices().length;
      if (faceVertexCount == 3) numVerties += 3;
      else if (faceVertexCount == 4) numVerties += 6;
    })
    var geometry = new Geometry({
      position : {
        type: 'Vec3',
        length : numVerties
      },
      normal : {
        type: 'Vec3',
        length : numVerties
      }
    });

    var positions = geometry.attribs.position.data;
    var normals = geometry.attribs.normal.data;

    var vertexIndex = 0;
    for(var i in faces) {
      var face = faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        Vec3.copy(positions[vertexIndex+0], faceVertices[0].position);
        Vec3.copy(positions[vertexIndex+1], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+2], faceVertices[2].position);
        Vec3.copy(normals[vertexIndex+0], faceNormal);
        Vec3.copy(normals[vertexIndex+1], faceNormal);
        Vec3.copy(normals[vertexIndex+2], faceNormal);
        vertexIndex += 3;
      }
      else if (faceVertices.length == 4) {
        Vec3.copy(positions[vertexIndex+0], faceVertices[0].position);
        Vec3.copy(positions[vertexIndex+1], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+2], faceVertices[3].position);
        Vec3.copy(positions[vertexIndex+3], faceVertices[3].position);
        Vec3.copy(positions[vertexIndex+4], faceVertices[1].position);
        Vec3.copy(positions[vertexIndex+5], faceVertices[2].position);
        Vec3.copy(normals[vertexIndex+0], faceNormal);
        Vec3.copy(normals[vertexIndex+1], faceNormal);
        Vec3.copy(normals[vertexIndex+2], faceNormal);
        Vec3.copy(normals[vertexIndex+3], faceNormal);
        Vec3.copy(normals[vertexIndex+4], faceNormal);
        Vec3.copy(normals[vertexIndex+5], faceNormal);
        vertexIndex += 6;
      }
      else {
        console.log("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
        //throw("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
      }
    }
    return geometry;
  };

  HEMesh.prototype.toEdgesGeometry = function(offset) {
    offset = (offset !== undefined) ? offset : 0.1;
    var lineBuilder = new LineBuilder();

    var a = Vec3.create();
    var b = Vec3.create();
    this.edges.forEach(function(e) {
      var center = e.face.getCenter();
      Vec3.sub(a, center, e.vert.position);
      Vec3.sub(b, center, e.next.vert.position);
      Vec3.scale(a, a, offset);
      Vec3.scale(b, b, offset);
      Vec3.add(a, a, e.vert.position);
      Vec3.add(b, b, e.next.vert.position);
      lineBuilder.addLine(a, b);
    });
    return lineBuilder;
  };

  return HEGeometryConverter;
});
