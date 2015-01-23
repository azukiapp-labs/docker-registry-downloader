var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var traceur = require('gulp-traceur');
var clean = require('gulp-clean');
var plumber = require('gulp-plumber');
var yargs = require('yargs');

var sources = ['src/**/*.js'];
var testSources = ['spec/**/*.js'];
var allSources = sources.concat(testSources);

var sourcesTranspiled = ['lib/src/**/*.js'];
var testTranspiled = ['lib/spec/**/*.js'];


gulp.task('clean', function () {
    return gulp.src('lib', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('traceurNodeSource', ['clean'], function () {
    return gulp.src(sources)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(traceur({
            sourceMaps: true,
            modules: 'commonjs'
         }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib/src'));
});

gulp.task('traceurNodeTest', ['clean'], function () {
    return gulp.src(testSources)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(traceur({
            sourceMaps: true,
            modules: 'commonjs'
         }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib/spec'));
});

gulp.task('build', ['traceurNodeSource', 'traceurNodeTest']);

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);

/**
 * mocha + watch
 */
gulp.task('test', ['mocha', 'test-watch']);
gulp.task('test-watch', function() {
    gulp.watch(allSources, ['mocha']);
});
gulp.task('mocha', ['build'], function() {
    var mocha = require('gulp-mocha');
    var gutil = require('gulp-util');

    return gulp.src(testTranspiled, { read: false })
        .pipe( mocha( {
            reporter: 'spec', growl: 'true', grep: yargs.argv.grep, timeout: 4000
        } ))
        .on('error', gutil.log);
});
