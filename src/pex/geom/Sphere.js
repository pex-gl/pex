//Sphere geometry generator.

//## Parent class : [Geometry](../core/Geometry.html)

//## Example use
//      var sphere = new Sphere(1, 36, 36);
//      var sphereMesh = new Mesh(sphere, new Materials.TestMaterial());

//## Reference
define(["pex/core/Vec2", "pex/core/Vec3", "pex/core/Face3", "pex/core/Geometry"], function(Vec2, Vec3, Face3, Geometry) {
  //### Sphere ( r, nsides, nsegments )
  //`r` - radius of the sphere *{ Number }*  
  //`nsides` - number of subdivisions on XZ axis *{ Number }*  
  //`nsegments` - number of subdivisions on Y axis *{ Number }*
  function Sphere(r, nsides, nsegments) {
    r = r || 0.5;
    nsides = nsides || 36;
    nsegments = nsegments || 18;

    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];

    var degToRad = 1/180.0 * Math.PI;

    var dphi   = 360.0/nsides;
    var dtheta = 180.0/nsegments;

    function evalPos(theta, phi) {
      var pos = new Vec3();
      pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
      pos.y = r * Math.cos(theta * degToRad);
      pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
      return pos;
    }

    for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
      for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) {
        var pos = evalPos(theta, phi);

        var n = pos.normalized();

        vertices.push(new Vec3(pos.x, pos.y, pos.z));
        normals.push(new Vec3(n.x, n.y, n.z));
        texCoords.push(new Vec2(phi/360.0, theta/180.0));

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
  }

  Sphere.prototype = new Geometry();

  return Sphere;
});