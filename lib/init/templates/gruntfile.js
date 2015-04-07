module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      pex: {
        src: ['./main.js'],
        dest: './main.web.js',
        options: {
          ignore: ['plask'],
          transform: [['brfs', {'global':true}]],
          watch: true,
          keepAlive: true
        }
      }
    },
    browserSync: {
      pex: {
        bsFiles: {
          src : './main.web.js'
        },
        options: {
          watchTask: true,
          server: {
            baseDir: "./"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.registerTask('default', ['browserSync', 'browserify']);
};
