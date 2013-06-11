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

    var positions = geom.vertices;

    for(var i=0; i<positions.length; i++) {
      var pos = positions[i];
      this.vertices.push(new HEVertex(pos.x, pos.y, pos.z));
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

  HEMesh.prototype.toFlatGeometry = function(geometry, selectedOnly) {
    selectedOnly = (typeof(selectedOnly) === 'undefined') ? false : selectedOnly;
    var numVertices = 0;
    var faces = this.faces;
    if (selectedOnly) {
      faces = this.getSelectedFaces();
    }

    faces.forEach(function(f) {
      var faceVertexCount = f.getAllVertices().length;
      if (faceVertexCount == 3) numVertices += 3;
      else if (faceVertexCount == 4) numVertices += 6;
    });

    if (!geometry) {
      geometry = new Geometry({vertices:true, normals:true})
    }

    geometry.allocate(numVertices);

    var positions = geometry.vertices;
    var normals = geometry.normals;

    geometry.vertices.isDirty = true;
    geometry.normals.isDirty = true;

    var vertexIndex = 0;
    for(var i in faces) {
      var face = faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        positions[vertexIndex+0].copy(faceVertices[0].position);
        positions[vertexIndex+1].copy(faceVertices[1].position);
        positions[vertexIndex+2].copy(faceVertices[2].position);
        normals[vertexIndex+0].copy(faceNormal);
        normals[vertexIndex+1].copy(faceNormal);
        normals[vertexIndex+2].copy(faceNormal);
        vertexIndex += 3;
      }
      else if (faceVertices.length == 4) {
        positions[vertexIndex+0].copy(faceVertices[0].position);
        positions[vertexIndex+1].copy(faceVertices[1].position);
        positions[vertexIndex+2].copy(faceVertices[3].position);
        positions[vertexIndex+3].copy(faceVertices[3].position);
        positions[vertexIndex+4].copy(faceVertices[1].position);
        positions[vertexIndex+5].copy(faceVertices[2].position);
        normals[vertexIndex+0].copy(faceNormal);
        normals[vertexIndex+1].copy(faceNormal);
        normals[vertexIndex+2].copy(faceNormal);
        normals[vertexIndex+3].copy(faceNormal);
        normals[vertexIndex+4].copy(faceNormal);
        normals[vertexIndex+5].copy(faceNormal);
        vertexIndex += 6;
      }
      else {
        console.log("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
        //throw("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
      }
    }
    return geometry;
  };

  /*
  HEMesh.prototype.toSmoothGeometry = function(geometry) {
    if (!geometry) {
      geometry = new Geometry({
        vertices : {
          name: 'position'
          type: 'Vec3',
          length : numVertices
        },
        normal : {
          name: 'normal'
          type: 'Vec3',
          length : numVertices
        }
      });

      geometry = Geometry.create().addAttribute('normals', 'normal', Vec3)
    }

    if (!geometry.attribs.tangent) {
      geometry.addAttribute('vertices', 'postion', Vec3 })
      geometry.addAttribute('tangents', 'tangent', Vec3 })
    }

    var positions = geometry.attribs.position.data;
    var normals = geometry.attribs.normal.data;
    var tangents = geometry.attribs.tangents.data;

    geometry.attribs.position.data
    geometry.positions

    var idx = 0;
    for(var i in this.faces) {
      var face = this.faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        geometry.vertices.push(new Vec3(faceVertices[0].x, faceVertices[0].y, faceVertices[0].z));
        geometry.vertices.push(new Vec3(faceVertices[1].x, faceVertices[1].y, faceVertices[1].z));
        geometry.vertices.push(new Vec3(faceVertices[2].x, faceVertices[2].y, faceVertices[2].z));
        geometry.normals.push(faceVertices[0].getNormal());
        geometry.normals.push(faceVertices[1].getNormal());
        geometry.normals.push(faceVertices[2].getNormal());
      }
      else if (faceVertices.length == 4) {
        geometry.vertices.push(new Vec3(faceVertices[0].x, faceVertices[0].y, faceVertices[0].z));
        geometry.vertices.push(new Vec3(faceVertices[1].x, faceVertices[1].y, faceVertices[1].z));
        geometry.vertices.push(new Vec3(faceVertices[3].x, faceVertices[3].y, faceVertices[3].z));
        geometry.vertices.push(new Vec3(faceVertices[3].x, faceVertices[3].y, faceVertices[3].z));
        geometry.vertices.push(new Vec3(faceVertices[1].x, faceVertices[1].y, faceVertices[1].z));
        geometry.vertices.push(new Vec3(faceVertices[2].x, faceVertices[2].y, faceVertices[2].z));
        geometry.tangents.push(faceVertices[0].tangent);
        geometry.tangents.push(faceVertices[1].tangent);
        geometry.tangents.push(faceVertices[3].tangent);
        geometry.tangents.push(faceVertices[3].tangent);
        geometry.tangents.push(faceVertices[1].tangent);
        geometry.tangents.push(faceVertices[2].tangent);
        geometry.normals.push(faceVertices[0].getNormal());
        geometry.normals.push(faceVertices[1].getNormal());
        geometry.normals.push(faceVertices[3].getNormal());
        geometry.normals.push(faceVertices[3].getNormal());
        geometry.normals.push(faceVertices[1].getNormal());
        geometry.normals.push(faceVertices[2].getNormal());
      }
      else {
        console.log("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
        //throw("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
      }
    }
    return geometry;
  }
  */

  HEMesh.prototype.toEdgesGeometry = function(offset) {
    offset = (offset !== undefined) ? offset : 0.1;
    var lineBuilder = new LineBuilder();

    var a = Vec3.create();
    var b = Vec3.create();
    this.edges.forEach(function(e) {
      var center = e.face.getCenter();
      a.asSub(center, e.vert.position).scale(offset).add(e.vert.position);
      b.asSub(center, e.next.vert.position).scale(offset).add(e.next.vert.position);
      lineBuilder.addLine(a, b);
    });
    return lineBuilder;
  };

  return HEGeometryConverter;
});
