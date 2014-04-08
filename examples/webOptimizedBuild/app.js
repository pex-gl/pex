// require requirejs as node module if app is not running in browser
if (typeof window === "undefined") var require = require("requirejs");

// configure requirejs for pex source
require.config({
	paths: {
		"pex": "../../src/pex",
		"lib": "../../src/lib"
	}
});

// run pex using requirejs
require([
	"pex/scene/PerspectiveCamera",
	"pex/scene/Arcball",
	"pex/gl/Mesh",
	"pex/geom/gen",
	"pex/geom/Quat",
	"pex/geom/Vec3",
	"pex/materials",
	"pex/sys/Window"
], function(PerspectiveCamera, Arcball, Mesh, Gen, Quat, Vec3, Materials, Window) {
	Window.create({
		settings: {
			width: 1280,
			height: 720,
			type: '3d'
		},

		init: function() {
			this.camera = new PerspectiveCamera(60, this.width/this.height);
			this.arcball = new Arcball(this, this.camera, 2);
			this.mesh = new Mesh(new Gen.Cube(), new Materials.ShowNormals());
			this.mesh.rotation = new Quat().setAxisAngle(new Vec3(1, 0, 0), 45);
			this.framerate(60);
		},

		draw: function() {
			var gl = this.gl;
			gl.clearColor(0, 0, 0, 1);
			gl.enable(gl.DEPTH_TEST);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			this.mesh.draw(this.camera);
		}
	});
});
