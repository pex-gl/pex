//Cube geometry generator.

//## Parent class : [Geometry](../core/Geometry.html)

//## Example use
//      var cube = new Cube(1, 1, 1, 10, 10, 10);
//      var cubeMesh = new Mesh(cube, new Materials.TestMaterial());

//## Reference
define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Face4", "pex/core/Geometry"], function(Vec2, Vec3, Face4, Geometry) {
  //### Cube ( sx, sy, sz, nx, ny, nz )
  //`sx` - size x / width *{ Number }*  
  //`sy` - size y / height *{ Number }*  
  //`sz` - size z / depth *{ Number }*  
  //`nx` - number of subdivisions on x axis *{ Number/Int }*  
  //`ny` - number of subdivisions on y axis *{ Number/Int }*  
  //`nz` - number of subdivisions on z axis *{ Number/Int }*
  function Cube(sx, sy, sz, nx, ny, nz) {
    sx = sx || 1;
    sy = sy || sx || 1;
    sz = sz || sx || 1;
    nx = nx || 1;
    ny = ny || 1;
    nz = nz || 1;

    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];

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
    function makePlane(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
      var vertShift = vertices.length;
      for(var j=0; j<=nv; ++j) {
        for(var i=0; i<=nu; ++i) {
          var vert = new Vec3();
          vert[u] = (-su/2 + i*su/nu) * flipu;
          vert[v] = (-sv/2 + j*sv/nv) * flipv;
          vert[w] = pw;
          vertices.push(vert);

          var texCoord = new Vec2(i/nu, j/nv);
          texCoords.push(texCoord);

          var normal = new Vec3();
          normal[u] = 0;
          normal[v] = 0;
          normal[w] = pw/Math.abs(pw);
          normals.push(normal);
        }
      }
      for(var j=0; j<nv; ++j) {
        for(var i=0; i<nu; ++i) {
          var n = vertShift + j * (nu + 1) + i;
          var face = new Face4(n, n + nu  + 1, n + nu + 2, n + 1);
          faces.push(face);
        }
      }
    }

    makePlane('x', 'y', 'z', sx, sy, nx, ny,  sz/2,  1, -1); //front
    makePlane('x', 'y', 'z', sx, sy, nx, ny, -sz/2, -1, -1); //back
    makePlane('z', 'y', 'x', sz, sy, nz, ny, -sx/2,  1, -1); //left
    makePlane('z', 'y', 'x', sz, sy, nz, ny,  sx/2, -1, -1); //right
    makePlane('x', 'z', 'y', sx, sz, nx, nz,  sy/2,  1,  1); //top
    makePlane('x', 'z', 'y', sx, sz, nx, nz, -sy/2,  1, -1); //bottom
  }


  Cube.prototype = new Geometry();

  return Cube;
});