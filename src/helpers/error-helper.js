var clc          = require('cli-color');
var repeating    = require('repeating');
var indentString = require('indent-string');
var _            = require('lodash');

module.exports = function(title, err) {
  if (!err && !title) {
    return;
  }
  var line = '';
  var error = [];
  error.push('');

  if (_.isString(title)) {
    line = '  ' + repeating('-', title.length - 2);
    error.push(line);
    error.push(' '  + clc.red.bold(title));
  } else {
    err = title;
  }

  if (!err.message) {
    return;
  }

  line = '  ' + repeating('-', err.message.length - 2);
  error.push(line);
  error.push(' ' + clc.red.bold(err.message));
  error.push(line);
  error.push('');

  var identedStack = indentString(err.stack, ' ', 2);
  error.push(clc.red(identedStack));

  error.push('');
  console.log(error.join('\n'));
};
