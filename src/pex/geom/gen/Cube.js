define(['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec2Array', 'pex/geom/Vec3Array', 'pex/geom/Face4', 'pex/geom/Geometry'],
  function(Vec2, Vec3, Vec2Array, Vec3Array, Face4, Geometry) {
  function Cube(sx, sy, sz, nx, ny, nz) {
    Geometry.call(this);
    sx = sx || 1;
    sy = sy || sx || 1;
    sz = sz || sx || 1;
    nx = nx || 1;
    ny = ny || 1;
    nz = nz || 1;

    var numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;
    var vertexIndex = 0;

    this.attribs = [];
    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];

    var positionAttrib = new Vec3Array(numVertices);
    var texCoordAttrib = new Vec3Array(numVertices);
    var normalAttrib = new Vec3Array(numVertices);

    this.positionAttrib = positionAttrib;
    this.texCoordAttrib = texCoordAttrib;
    this.normalAttrib = normalAttrib;

    function makePlane(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
      var vertShift = vertexIndex;
      for(var j=0; j<=nv; ++j) {
        for(var i=0; i<=nu; ++i) {
          var vert = positionAttrib[vertexIndex];
          vert[u] = (-su/2 + i*su/nu) * flipu;
          vert[v] = (-sv/2 + j*sv/nv) * flipv;
          vert[w] = pw;

          var texCoord = texCoordAttrib[vertexIndex];
          texCoord[0] = i/nu;
          texCoord[1] = j/nv;

          var normal = normalAttrib[vertexIndex];
          normal[u] = 0;
          normal[v] = 0;
          normal[w] = pw/Math.abs(pw);

          ++vertexIndex;
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

    makePlane(0, 1, 2, sx, sy, nx, ny,  sz/2,  1, -1); //front
    makePlane(0, 1, 2, sx, sy, nx, ny, -sz/2, -1, -1); //back
    makePlane(2, 1, 0, sz, sy, nz, ny, -sx/2,  1, -1); //left
    makePlane(2, 1, 0, sz, sy, nz, ny,  sx/2, -1, -1); //right
    makePlane(0, 2, 1, sx, sz, nx, nz,  sy/2,  1,  1); //top
    makePlane(0, 2, 1, sx, sz, nx, nz, -sy/2,  1, -1); //bottom
  }


  Cube.prototype = Object.create(Geometry.prototype);

  return Cube;
});