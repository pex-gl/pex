define(['pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Face3', 'pex/geom/Geometry'],
  function(Vec2, Vec3, Face3, Geometry) {

  function Sphere(r, nsides, nsegments) {
    r = r || 0.5;
    nsides = nsides || 36;
    nsegments = nsegments || 18;

    var numVertices = (nsides + 1) * (nsegments + 1);
    var vertexIndex = 0;

    var attribs = {
      position : {
        type : 'Vec3',
        length : numVertices
      },
      normal : {
        type : 'Vec3',
        length : numVertices
      },
      texCoord : {
        type : 'Vec2',
        length : numVertices
      }
    };

    Geometry.call(this, attribs);

    var positions = this.attribs.position.data;
    var normals = this.attribs.normal.data;
    var texCoords = this.attribs.texCoord.data;
    var faces = this.faces;

    var degToRad = 1/180.0 * Math.PI;

    var dphi   = 360.0/nsides;
    var dtheta = 180.0/nsegments;

    function evalPos(pos, theta, phi) {
      pos[0] = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
      pos[1] = r * Math.cos(theta * degToRad);
      pos[2] = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
    }

    for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
      for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) {
        var vert = positions[vertexIndex];
        var normal = normals[vertexIndex];
        var texCoord = texCoords[vertexIndex];

        evalPos(vert, theta, phi);

        Vec3.copy(normal, vert);
        Vec3.normalize(normal, normal);
        Vec2.set(texCoord, phi/360.0, theta/180.0);

        ++vertexIndex;

        if (segment == nsegments) continue;
        if (side == nsides) continue;

        faces.push(new Face3(
          (segment  )*(nsides+1) + side,
          (segment+1)*(nsides+1) + side,
          (segment+1)*(nsides+1) + side + 1
        ));

        faces.push(new Face3(
          (segment  )*(nsides+1) + side,
          (segment+1)*(nsides+1) + side + 1,
          (segment  )*(nsides+1) + side + 1
        ));
      }
    }

    //console.log('Num vertices estimated', numVertices, 'final', vertices.length);
  }

  Sphere.prototype = Object.create(Geometry.prototype);

  return Sphere;
});