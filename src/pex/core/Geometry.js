//A collection of vertices, vertex attributes and faces or edges defining a
//3d shape.

//## Example use
//     var geom = new Geometry();
//     geom.vertices = [
//       new Vec3(0, 1, 0),
//       new Vec3(0, 0, 0),
//       new Vec3(1, 1, 0)
//     ];
//     geom.faces = [
//       new Face3(0, 1, 2)
//     ];
//     geom.computeNormals();
//     var material = new Materials.SolidColorMaterial();
//     var mesh = new Mesh(geom, material);

//Geometry can't be rendered by itself. First it has to be convertet to a [Vbo](Vbo.html). 
//The [Mesh](Mesh.html) class does it for us automaticaly.

//## Reference
define([
  "pex/core/Edge", 
  "pex/core/Face3", 
  "pex/core/Face4", 
  "pex/core/Vec3", 
  "pex/util/Log"
  ], function(Edge, Face3, Face4, Vec3, Log) {
 
  //### Geometry ( )
  //Does nothing beside setting empty *vertices* array as it's possible 
  //to have geometry with just points and no index buffer at all.
  function Geometry() {
    this.vertices = [];
  }

  //### Geometry.MAX_VERTICES
  //Maximum number of different vertices per geometry. Limited by the type of 
  //index buffer variables which according to WebGL is a 16 bit integer.
  Geometry.MAX_VERTICES = 65536;

  //### computeNormals ( )
  //Computes per vertex normal by averaging the normals of faces connected
  //with that vertex.
  Geometry.prototype.computeNormals = function() {
    if (!this.faces || this.faces.length == 0) {
      return;
    }

    this.normals = [];
    for(var i=0; i<this.vertices.length; i++) {
      this.normals.push(new Vec3(0,0,0));
    }
    for(var i=0; i<this.faces.length; i++) {
      var face = this.faces[i];
      if (face instanceof Face3) {
        var a = this.vertices[face.a];
        var b = this.vertices[face.b];
        var c = this.vertices[face.c];
        var ab = b.subbed(a);
        var ac = c.subbed(a);
        var n = ab.cross(ac);
        n.normalize();
        face.normal = n;


        this.normals[face.a].add(n);
        this.normals[face.b].add(n);
        this.normals[face.c].add(n);
      }
    }

    for(var i=0; i<this.normals.length; i++) {
      this.normals[i].normalize();
    }
  }

  //### computeEdges ( )
  //Computes unique edges from existing faces.
  Geometry.prototype.computeEdges = function() {
    this.edges = [];
    this.vertexEdges = [];

    for(var i=0; i<this.vertices.length; i++) {
      this.vertexEdges.push([]);
    }

    for(var i=0; i<this.faces.length; i++) {
      var face = this.faces[i];
      if (face instanceof Face3) {
        this.edges.push(new Edge(face.a, face.b));
        this.edges.push(new Edge(face.b, face.c));
        this.edges.push(new Edge(face.c, face.a));
      }
      else if (face instanceof Face4) {
        this.edges.push(new Edge(face.a, face.b));
        this.edges.push(new Edge(face.b, face.c));
        this.edges.push(new Edge(face.c, face.d));
        this.edges.push(new Edge(face.d, face.a));
      }
    }

    /* Remove duplicates */
    for(var i=0; i<this.edges.length; i++) {
      var edgeI = this.edges[i];
      for(var j=i+1; j<this.edges.length; j++) {
        var edgeJ = this.edges[j];
        if ((edgeI.a == edgeJ.a && edgeI.b == edgeJ.b) || (edgeI.a == edgeJ.b && edgeI.b == edgeJ.a)) {
          this.edges.splice(j, 1);
          j--;
        }
      }
      this.vertexEdges[edgeI.a].push(edgeI);
      this.vertexEdges[edgeI.b].push(edgeI);
    }
  }
    
  //### split ( maxVertices )
  //Splits the gometry to several smaller one so that each one of them 
  //has less than Geometry.MAX_VERTICES vertices.  
  //
  //`maxVertices` - maximum number of vertices that each geometry should contain
  //*{ Number }* = MAX_VERTICES
  //
  //Returns an array of geometries *{ Array of Geometries }*   
  //
  //*Note: Only meshes with edges are supported at the moment.*
  Geometry.prototype.split = function(maxVertices) {
    maxVertices = maxVertices || Geometry.MAX_VERTICES;

    var geometries = [];
    var attributes = {"vertices":"", "texCoords":"", "normals":"", "colors":""};

    if (this.faces) {
      Log.eror("Geometry.split ERROR : Only edge meshes are supported at the moment");
      return;
    }
    else if (this.edges) {
      Log.message("Geometry.split edges");
      var geometry = null;
      var numVertices = 0;
      for(var i=0; i<this.edges.length; i++) {
        if (geometry == null) {
          Log.message("Geometry.split geometries.length : " + (geometries.length + 1));
          geometry = new Geometry();
          geometry.edges = [];
          for(var attribName in attributes) {
            if (!this[attribName]) continue;
            geometry[attribName] = [];
          }
          geometries.push(geometry);
          numVertices = 0;
        }

        var edge = this.edges[i];

        var full = false;
        for(var attribName in attributes) {
          if (!this[attribName]) continue;
          geometry[attribName].push(this[attribName][edge.a]);
          geometry[attribName].push(this[attribName][edge.b]);
          if (geometry[attribName].length >= Geometry.MAX_VERTICES - 2) {
            full = true;
          }
        }

        geometry.edges.push(new Edge(numVertices, numVertices+1));
        numVertices += 2;

        if (full) {
          geometry = null;
        }
      }
    }
    else {
      /*We gonna draw unindexed array so no problem and no need to split*/
      geometries.push(this);
    }


    return geometries;
  }

  return Geometry;
});