// require requirejs if not running in browser
if (typeof window === "undefined") var require = require("requirejs");

// configure requirejs for pex source
require.config({
	paths: {
		"pex": "../../src/pex",
		"lib": "../../src/lib"
	}
});

// run pex app
require([
	"pex/Color/Color",
	"pex/geom/gen",
	"pex/geom/Vec3",
	"pex/scene/Arcball",
	"pex/scene/PerspectiveCamera",
	"pex/sys/Window",
	"displacement"
], function(Color, Gen, Vec3, Arcball, Camera, Window, Displacement) {
	Window.create({
		settings: {
			width: 1280,
			height: 720,
			type: "3d",
			vsync: true,
			multisample: true
		},

		init: function() {
			this.camera = new Camera(60, this.width / this.height);
			this.arcball = new Arcball(this, this.camera, 3);

			this.figures = [];

			var geom = new Gen.Plane(1, 1, 64, 64);

			var color = new Color(0.17, 0.12, 0.3, 1.0);
			var pos = new Vec3();

			this.figure = new Displacement(this.gl, geom, color, pos);

			this.gl.enable(this.gl.DEPTH_TEST);
		},

		draw: function() {
			this.gl.clearColor(0.1, 0.1, 0.1, 1);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

			this.figure.update();
			this.figure.draw(this.camera);
		}
	});
});
