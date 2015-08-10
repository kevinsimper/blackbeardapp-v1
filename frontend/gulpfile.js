var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var envify = require('envify/custom')
var sass = require('gulp-sass')
var plumber = require('gulp-plumber')
var through2 = require('through2')
var vinyl = require('vinyl')
var yaml = require('js-yaml')
var fs = require('fs')
var path = require('path')

var production = (process.env.NODE_ENV) ? true : false;
console.log(production)

// This can be improved 
// when we switch to something else than harp for templating
// Then we can just put in the host in the main template
if(production) {
  process.env.BACKEND_HOST = 'http://api.blackbeard.io'
} else {
  var doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config/development.yml'), 'utf8'));
  process.env.BACKEND_HOST = doc.common.environment[0].split('=')[1]
}
console.log(process.env.BACKEND_HOST)

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

  return gulp.src(['./app/frontpage/index.js'])
    .pipe(browserified)
    .pipe(rename('bundle.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('public/build/'));
});

gulp.task('browserify-controlpanel', function() {
  return gulp.src(['./app/controlpanel/index.js'])
    .pipe(through2.obj(function(file, enc, next) {
      var self = this
      var b = browserify();
      b.add(file.path)
      b.transform(reactify)
      b.transform(envify({
        NODE_ENV: 'development',
        BACKEND_HOST: process.env.BACKEND_HOST
      }))
      b.bundle( function(err, src) {
        if(err) console.log(err);
        self.push( new vinyl({
          path: file.path,
          contents: src
        }));
        next();
      })
    }))
    .pipe(rename('controlpanel.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('./public/build/'));
});

gulp.task('sass', function() {
  return gulp.src(['./app/controlpanel/controlpanel.scss', './styles/main.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/build'))
})

gulp.task('build', ['browserify', 'browserify-controlpanel', 'sass']);
gulp.task('default', ['browserify', 'browserify-controlpanel', 'sass'], function() {
  gulp.watch(['./app/*.js', './app/*.jsx'], ['browserify']);
  gulp.watch(['./app/controlpanel/**/*.js', './app/controlpanel/**/*.jsx'], ['browserify-controlpanel']);
  gulp.watch(['./app/controlpanel/**/*.scss', './styles/**/*.scss'], ['sass']);
});
