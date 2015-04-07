var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var browserSync = require('browser-sync');
var b = browserify(watchify.args);

gulp.task('watch', function() {

    b.add('./main.js');

    b.transform({global:true}, 'brfs');
    b.ignore('plask');

    var bundler = watchify(b);
    bundler.on('update', rebundle);
    
    function rebundle () {
        return bundler.bundle()
        // log errors if they happen
        .on('error', function(e) {
            gutil.log('Browserify Error', e);
        })
        .pipe(source('main.web.js'))
        .pipe(gulp.dest('./'))
        .pipe(browserSync.reload({ stream:true }));
    }

     return rebundle()
})


gulp.task('hot', function() {
    var config = {
        files: ['./main.web.js'],
        server: {
            baseDir: './'
        }
    };

    browserSync(config, function(err, bs) {
        if (!err) {
            console.log('hot stream ready.');
        }
    });
})

gulp.task('default', ['watch', 'hot'], function () {
});
