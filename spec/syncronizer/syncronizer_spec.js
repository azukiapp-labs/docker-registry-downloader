require('source-map-support').install();
// var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var log = require('../../src/helpers/logger');
var logError = require('../../src/helpers/error-helper');
Q.onerror = logError;

import Syncronizer from '../../src/syncronizer';

describe('Syncronizer', function() {

  it('should compare local and registry layers', function(done) {
    var syncronizer = new Syncronizer();
    Q.spawn(function* () {
      var namespace = 'library';
      var repository = 'node';
      var tag = '0.10';

      var result = yield syncronizer.compare(namespace, repository, tag);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
