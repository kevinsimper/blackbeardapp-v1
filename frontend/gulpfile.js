var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');

gulp.task('browserify', function() {
  var b = browserify()
    .transform(reactify);

  var browserified = transform(function(filename) {
    b.add(filename);
    return b.bundle();
  });

  return gulp.src(['./app/index.js'])
    .pipe(browserified)
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('public/build/'))
});

gulp.task('build', ['browserify']);
gulp.task('default', ['browserify'], function() {
  gulp.watch(['./app/**'], ['browserify']);
});