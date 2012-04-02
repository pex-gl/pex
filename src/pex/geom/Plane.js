//Plane geometry generator.

//## Parent class : [Geometry](../core/Geometry.html)

//## Example use
//      var plane = new Plane(1, 1, 10, 10, 'x', 'y');
//      var planeMesh = new Mesh(plane, new Materials.TestMaterial());

//## Reference
define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Face4", "pex/core/Edge", "pex/core/Geometry"], function(Vec2, Vec3, Face4, Edge, Geometry) {
  //### Plane ( sx, sy, nx, ny, u, v)
  //`su` - size u / width *{ Number }*  
  //`sv` - size v / height *{ Number }*  
  //`nu` - number of subdivisions on u axis *{ Number/Int }*  
  //`nv` - number of subdivisions on v axis *{ Number/Int }*  
  //`u` - first axis *{ String }* = "x"
  //`v` - second axis *{ Number/Int }* = "y"
  function Plane(su, sv, nu, nv, u, v) {
    su = su || 1;
    sv = sv || su || 1;
    nu = nu || 1;
    nv = nv || nu || 1;
    u = u || 'x';
    v = v || 'y';    
    
    var w = ['x', 'y', 'z'];
    w.splice(w.indexOf(u), 1);
    w.splice(w.indexOf(v), 1);
    w = w[0];

    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];
    var edges = this.edges = [];

    // How faces are constructed:
    //
    //     0-----1 . . 2       n  <----  n+1
    //     |   / .     .       |         A
    //     | /   .     .       V         |
    //     3 . . 4 . . 5      n+nu --> n+nu+1
    //     .     .     .
    //     .     .     .
    //     6 . . 7 . . 8
    //
    var vertShift = vertices.length;
    for(var j=0; j<=nv; ++j) {
      for(var i=0; i<=nu; ++i) {
        var vert = new Vec3();
        vert[u] = (-su/2 + i*su/nu);
        vert[v] = (-sv/2 + j*sv/nv);
        vert[w] = 0;
        vertices.push(vert);

        var texCoord = new Vec2(i/nu, 1.0 - j/nv);
        texCoords.push(texCoord);

        var normal = new Vec3();
        normal[u] = 0;
        normal[v] = 0;
        normal[w] = 1;
        normals.push(normal);
      }
    }
    for(var j=0; j<nv; ++j) {
      for(var i=0; i<nu; ++i) {
        var n = vertShift + j * (nu + 1) + i;
        var face = new Face4(n, n + nu  + 1, n + nu + 2, n + 1);
        
        edges.push(new Edge(n, n + 1));
        edges.push(new Edge(n, n + nu + 1));
        
        if (j == nv - 1) {
          edges.push(new Edge(n + nu + 1, n + nu + 2));
        }
        if (i == nu - 1) {
          edges.push(new Edge(n + 1, n + nu + 2));
        }
        faces.push(face);
      }
    }
  }

  Plane.prototype = new Geometry();

  return Plane;
});