define([
	"perlin-noise-simplex",
	"pex/Color/Color",
	"pex/geom/Vec3",
	"pex/geom/Quat",
	"pex/gl/Mesh",
	"pex/gl/Program",
	"pex/materials/Material",
	"pex/utils/MathUtils",
	"lib/text!displacement.glsl"
], function(Noise, Color, Vec3, Quat, Mesh, Program, Material, MathUtils, GLSL) {
	function Displacement(gl, geom, color, position) {
		// initialize
		this.color = color || Color.Yellow;
		this.amplitude = Math.random();
		this.geom = geom;
		this.noise = new Noise();

		// create program
		this.program = new Program(GLSL);

		// compute geometry edges
		this.geom.computeEdges();

		// set starting perlin noise position
		this.displacementPosition = 0;

		// setup material and mesh
		this.material = new Material(this.program);
		this.mesh = new Mesh(geom, this.material, { useEdges: false });

		if (position) {
			[ "x", "y", "z" ].forEach(function(key) {
				this.mesh.position[key] = position[key];
			}.bind(this));
		}
	}

	Displacement.prototype.displace = function() {
		// update displacements
		this.displacementPosition += 0.001;
		this.geom.addAttrib("displacements", "displacement", this.geom.attribs.vertices.map(function(vertice) {
			return this.noise.noise3d(vertice.x + this.displacementPosition, vertice.y + this.displacementPosition, vertice.z + this.displacementPosition);
		}.bind(this)), true);
	};

	Displacement.prototype.update = function() {
		// slowly change amplitude
		this.amplitude += 0.001;
		var amplitudeValue = Math.sin(this.amplitude * Math.PI * 2);
		amplitudeValue = MathUtils.map(amplitudeValue, -1, 1, -0.4, 0.4);

		// rotate mesh
		this.mesh.rotation = new Quat().setAxisAngle(new Vec3(0, 1, 0), this.amplitude * 100);

		// displace mesh
		this.displace();

		// update uniforms
		this.program.uniforms.ambientColor(this.color);
		this.program.uniforms.diffuseColor(new Color(1, 1, 1, 1.0));
		this.program.uniforms.lightPos(new Vec3(0, 0, 30));
		this.program.uniforms.amplitude(amplitudeValue);
	};

	Displacement.prototype.draw = function(camera) {
		this.mesh.draw(camera);
	};

	return Displacement;
});
