module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs: {
			compile: {
				options: {
					baseUrl: "src/",
					name: "../tools/lib/almond",
					include: [ '../tools/include/inject', 'pex', '../tools/include/export' ],
					optimize: 'none',
					out: 'build/<%= pkg.name %>.js'
				}
			}
		},
		exec: {
			npm: {
				command: 'npm update'
			},
			docco: {
				command: 'docco src/ -o docs/ -i Pex'
			}
		},
		jshint: {
			files: [ 'src/**', 'examples/**', '*.js' ],
		},
		watch: {
			files: [ '<%= jshint.files %>' ],
			tasks: [ 'lint' ]
		}
	});

	// load libs
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-exec');

	// linting task
	grunt.registerTask('lint', [ 'jshint' ]);

	// doc building task
	grunt.registerTask('docs', [ 'docco' ]);

	// building task
	grunt.registerTask('build', [ 'lint', 'exec:requirejs' ]);
};
