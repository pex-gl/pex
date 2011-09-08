define(["pex/core/Core"], function(Core) {
  function Cube(sx, sy, sz, nx, ny, nz) {    
    sx = sx || 1;
    sy = sy || 1;
    sz = sz || 1;
    nx = nx || 1;
    ny = ny || 1;
    nz = nz || 1;
    
    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];
        
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
          var vert = new Core.Vec3();
          vert[u] = (-su/2 + i*su/nu) * flipu;
          vert[v] = (-sv/2 + j*sv/nv) * flipv;
          vert[w] = pw;
          vertices.push(vert);
          
          var texCoord = new Core.Vec2(i/nu, j/nv);
          texCoords.push(texCoord);
          
          var normal = new Core.Vec3();
          normal[u] = 0;
          normal[v] = 0;
          normal[w] = pw/Math.abs(pw);
          normals.push(normal);
        }
      }      
      for(var j=0; j<nv; ++j) {
        for(var i=0; i<nu; ++i) {          
          var n = vertShift + j * (nu + 1) + i;
          var face = new Core.Face4(n, n + nu  + 1, n + nu + 2, n + 1); 
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
  
  return Cube;
});