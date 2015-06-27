var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var envify = require('envify/custom')
var sass = require('gulp-sass')

var production = (process.env.NODE_ENV) ? true : false;
console.log(production)

// This can be improved 
// when we switch to something else than harp for templating
// Then we can just put in the host in the main template
if(!production) {
  process.env.BACKEND_HOST = 'http://docker.dev:8000'
} else {
  process.env.BACKEND_HOST = 'http://api.blackbeard.io'
}

gulp.task('browserify', function() {
  var b = browserify()
    .transform(reactify)
    .transform(envify({
      NODE_ENV: 'development',
      BACKEND_HOST: process.env.BACKEND_HOST
    }));

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

gulp.task('browserify-controlpanel', function() {
  var b = browserify()
    .transform(reactify)
    .transform(envify({
      NODE_ENV: 'development',
      BACKEND_HOST: process.env.BACKEND_HOST
    }));


  var browserified = transform(function(filename) {
    b.add(filename);
    return b.bundle();
  });

  return gulp.src(['./app/controlpanel/index.js'])
    .pipe(browserified)
    .pipe(rename('controlpanel.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('./public/build/'));
});

gulp.task('sass', function() {
  return gulp.src(['./app/controlpanel/controlpanel.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/build'))
})

gulp.task('build', ['browserify', 'browserify-controlpanel', 'sass']);
gulp.task('default', ['browserify', 'browserify-controlpanel', 'sass'], function() {
  gulp.watch(['./app/*.js'], ['browserify']);
  gulp.watch(['./app/controlpanel/**/*.js', './app/controlpanel/**/*.jsx'], ['browserify-controlpanel']);
  gulp.watch(['./app/controlpanel/**/*.scss'], ['sass']);
});
