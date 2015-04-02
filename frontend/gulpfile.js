var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');

var production = (process.env.NODE_ENV) ? true : false;
console.log(production)

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
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('public/build/'));
});

gulp.task('browserify-admin', function() {
  var b = browserify()
    .transform(reactify);

  var browserified = transform(function(filename) {
    b.add(filename);
    return b.bundle();
  });

  return gulp.src(['./app/admin/index.js'])
    .pipe(browserified)
    .pipe(rename('admin.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('public/build/'));
});

gulp.task('build', ['browserify', 'browserify-admin']);
gulp.task('default', ['browserify', 'browserify-admin'], function() {
  gulp.watch(['./app/**', './app/admin'], ['browserify']);
  gulp.watch(['./app/admin/**'], ['browserify-admin']);
});
