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
  'pex/geom/Edge'
],
function(Vec3, Face3, Face4, FacePolygon, Geometry, HEMesh, HEVertex, HEEdge, HEFace, Edge)  {
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
    this.fixVertexEdges();
    this.fixEdgePairs();
    this.check();
    return this;
  };

  HEMesh.prototype.toFlatGeometry = function() {
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.normals = [];
    geometry.texCoords = [];

    var hasColors = this.faces.filter(function(f) { return f.color !== null; }).length > 0;
    if (hasColors) {
      geometry.colors = [];
    }

    var idx = 0;
    for(var i in this.faces) {
      var face = this.faces[i];
      var faceVertices = face.getAllVertices();
      var faceNormal = face.getNormal();
      if (faceVertices.length == 3) {
        geometry.vertices.push(faceVertices[0].dup());
        geometry.vertices.push(faceVertices[1].dup());
        geometry.vertices.push(faceVertices[2].dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.texCoords.push(new Vec3(1, 0, 0));
        geometry.texCoords.push(new Vec3(0, 1, 0));
        geometry.texCoords.push(new Vec3(0, 0, 1));
        if (hasColors) {
          if (face.color) {
            geometry.colors.push(face.color);
            geometry.colors.push(face.color);
            geometry.colors.push(face.color);
          }
          else {
            geometry.colors.push(Color.White);
            geometry.colors.push(Color.White);
            geometry.colors.push(Color.White);
          }
        }
      }
      else if (faceVertices.length == 4) {
        geometry.vertices.push(faceVertices[0].dup());
        geometry.vertices.push(faceVertices[1].dup());
        geometry.vertices.push(faceVertices[3].dup());
        geometry.vertices.push(faceVertices[3].dup());
        geometry.vertices.push(faceVertices[1].dup());
        geometry.vertices.push(faceVertices[2].dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.normals.push(faceNormal.dup());
        geometry.texCoords.push(new Vec3(0, 0, 0));
        geometry.texCoords.push(new Vec3(0, 0, 0));
        geometry.texCoords.push(new Vec3(0, 0, 0));
        geometry.texCoords.push(new Vec3(0, 0, 0));
      }
      else {
        console.log("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
        //throw("HEGeometryConverter.thisToFlatGeometry: Unsupported face vertex count:" + faceVertices.length);
      }
    }
    return geometry;
  };

  HEMesh.prototype.toSmoothGeometry = function() {
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.normals = [];
    geometry.tangents = [];

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
  };


  HEMesh.prototype.toSelectionGeometry = function(normalLength) {
    normalLength = normalLength || 0.1;
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.edges = [];

    function selected(o) { return o.selected; }

    function buildPoint(v) {
      var i = geometry.vertices.push(v);
      var j = geometry.vertices.push(v.getNormal().scale(normalLength).add(v));
      geometry.edges.push(new Edge(i - 1, j - 1));
    }

    this.vertices.filter(selected).forEach(buildPoint);

    function buildFace(f) {
      f.edgePairLoop(function(a, b) {
        var i = geometry.vertices.push(a.vert);
        var j = geometry.vertices.push(b.vert);
        geometry.edges.push(new Edge(i - 1, j - 1));
      });
    }

    this.faces.filter(selected).forEach(buildFace);

    return geometry;
  };

  HEMesh.prototype.toTangentGeometry = function(len) {
    len = len || 0.1;
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.edges = [];
    geometry.colors = [];

    function selected(o) { return o.selected; }

    function buildPoint(v) {
      var i = geometry.vertices.push(v);
      var j = geometry.vertices.push(v.tangent.scaled(len).add(v));
      geometry.edges.push(new Edge(i - 1, j - 1));
      geometry.colors.push(Color.fromVec4(v.tangent));
    }

    this.vertices.forEach(buildPoint);

    return geometry;
  };

  HEMesh.prototype.toVerticesGeometry = function() {
    var geometry = new Geometry();
    geometry.vertices = this.vertices.map(function(v) { return new Vec3(v.x, v.y, v.z); });
    return geometry;
  };

  //HEMesh.prototype.toEdgesGeometry = function(offset) {
  //  offset = (offset !== undefined) ? offset : 0.1;
  //  var lineBuilder = new LineBuilder();
  //  this.edges.forEach(function(e) {
  //    var a = e.vert;
  //    var b = e.next.vert;
  //    var center = e.face.getCenter();
  //    a = a.added(center.subbed(a).scaled(offset));
  //    b = b.added(center.subbed(b).scaled(offset));
  //    lineBuilder.addLine(a, b);
  //  });
  //  return lineBuilder;
  //};

  return HEGeometryConverter;
});
