module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs: {
			compile: {
				options: {
					baseUrl: 'src',
					name: '../tools/lib/almond',
					include: [ '../tools/include/inject', 'pex', '../tools/include/export' ],
					optimize: 'none',
					insertRequire: [ 'pex' ],
					out: 'build/<%= pkg.name %>.js',
					wrap: {
						startFile: 'tools/include/wrapBegin.js',
						endFile: 'tools/include/wrapEnd.js'
					}
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
		coffee: {
			compile: {
				files: [ {
					expand: true,
					cwd: 'src',
					src: [ '**/*.coffee' ],
					dest: 'src',
					ext: '.js'
				} ]
			}
		},
		coffeelint: {
			app: [ 'src/**/*.coffee', 'examples/**/*.coffee' ]
		},
		jshint: {
			files: [ 'src/**/*.js', 'examples/**/*.js', '*.js' ],
		},
		watch: {
			files: [ '<%= jshint.files %>', '**/*.coffee' ],
			tasks: [ 'lint', 'coffee' ]
		}
	});

	// load libs
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-coffeelint');
	grunt.loadNpmTasks('grunt-exec');

	// linting task
	grunt.registerTask('lint', [ 'coffeelint', 'jshint' ]);

	// doc building task
	grunt.registerTask('docs', [ 'docco' ]);

	// building task
	grunt.registerTask('build', [ 'lint', 'coffee', 'exec:requirejs' ]);
};
