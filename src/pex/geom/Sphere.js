define(["pex/core/Core", "pex/geom/Geometry"], function(Core, Geometry) {
  function Sphere(r, nsides, nsegments) {
    r = r || 0.5;
    nsides = 36;
    nsegments = 18;

    var vertices = this.vertices = [];
    var texCoords = this.texCoords = [];
    var normals = this.normals = [];
    var faces = this.faces = [];

    var degToRad = 1/180.0 * Math.PI;

    var dphi   = 360.0/nsides;
    var dtheta = 180.0/nsegments;

    //var estimatedNumPoints = (Math.floor(360/dtheta) + 1) * (Math.floor(180/dphi) + 1);

  	function evalPos(theta, phi) {
  		var pos = new Core.Vec3();
  		pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
  		pos.y = r * Math.cos(theta * degToRad);
  		pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
  		return pos;
  	}

  	for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
  		for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) {
  		  var pos = evalPos(theta, phi);

  		  var n = pos.normalized();

  			vertices.push(new Core.Vec3(pos.x, pos.y, pos.z));
  			normals.push(new Core.Vec3(n.x, n.y, n.z));
  			texCoords.push(new Core.Vec2(phi/360.0, theta/180.0));

  			if (segment == nsegments) continue;
  			if (side == nsides) continue;

        faces.push(new Core.Face3(
    			(segment  )*(nsides+1) + side,
    			(segment+1)*(nsides+1) + side,
    			(segment+1)*(nsides+1) + side + 1
        ));

        faces.push(new Core.Face3(
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