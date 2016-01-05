
var azk_gulp = require('azk-dev/lib/gulp')({
  cwd  : __dirname,
  mocha: { timeout: 10000 }
});

// Load gulp
var gulp = azk_gulp.gulp;

gulp.task('lint:babel', "Run lint and babel after this", ['lint', 'babel']);
