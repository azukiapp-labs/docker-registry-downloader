require('source-map-support').install();

import "babel-polyfill";

var Helpers = {
  expect: require('azk-dev/lib/chai').expect,
};

export default Helpers;
