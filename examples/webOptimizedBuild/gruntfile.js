module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		requirejs: {
			compile: {
				options: {
					paths: { requireLib: 'node_modules/requirejs/require' },
					include: [ "requireLib" ],
					baseUrl: ".",
					mainConfigFile: "app.js",
					name: "app",
					optimize: "uglify2",
					out: "<%= pkg.name %>.min.js"
				}
			}
		}
	});

	// load libs
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-exec');

	// building task
	grunt.registerTask('build', [ 'requirejs' ]);
};
