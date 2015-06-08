// Lib path
var path = require('path');
var lib  = process.env.AZK_LIB_PATH || 'lib';

var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  src  : { src: "./src" , dest: path.join(lib, "/src") },
  spec : { src: "./spec", dest: path.join(lib, "/spec") },
  mocha: { timeout: 10000 },
  lint : [ "bin/**/*.js" ],
});

// Load gulp
var gulp = azk_gulp.gulp;

// Load envs from .env files
var dotenv = require('dotenv');
dotenv.load({ silent: true });

gulp.task('lint:babel', "Run lint and babel after this", ['lint', 'babel']);

gulp.task('clean', function () {
    return gulp.src('lib', {read: false})
        .pipe(clean({force: true}));
});
