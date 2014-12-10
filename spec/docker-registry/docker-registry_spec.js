require('source-map-support').install();
var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var logError = require('../../src/helpers/error-helper');
Q.onerror = logError;

import DockerHub from '../../src/docker-hub';
import DockerRegistry from '../../src/docker-registry';

describe('Docker Registry API', function() {

  var dockerHub = new DockerHub();
  var dockerRegistry = new DockerRegistry();
  var hubResultAzktcl = {
    endpoint: null,
    token:    null
  };

  // 1 - get endpoint and token
  Q.spawn(function* () {
    var namespace = 'azukiapp';
    var repository = 'azktcl';
    hubResultAzktcl = yield dockerHub.images(namespace, repository);
  });

  it('should get tags from azukiapp/azktcl', function(done) {
    Q.spawn(function* () {
        // 2 - get info from docker registry
        var result = yield dockerRegistry.tags(hubResultAzktcl.endpoint,
                                               hubResultAzktcl.token,
                                               'azukiapp',
                                               'azktcl');

        chai.expect(result).to.include.keys('0.0.1');
        chai.expect(result).to.include.keys('0.0.2');
        done();
    });
  });

  it('should get tags from library/node', function(done) {
    Q.spawn(function* () {
        // 1 - get endpoint and token
        var namespace = 'library';
        var repository = 'node';
        var hubResultNode = yield dockerHub.images(namespace, repository);

        // 2 - get info from docker registry
        var result = yield dockerRegistry.tags(hubResultNode.endpoint,
                                               hubResultNode.token,
                                               namespace,
                                               repository);

        chai.expect(result).to.include.keys('0.8');
        chai.expect(result).to.include.keys('0.10');
        chai.expect(result).to.include.keys('0.11');
        chai.expect(result).to.include.keys('latest');
        done();
    });
  });

  it('should get image id by tag name', function(done) {
    Q.spawn(function* () {
        var namespace = 'azukiapp';
        var repository = 'azktcl';
        var tag = '0.0.1';

        // 2 - get info from docker registry
        var result = yield dockerRegistry.getImageIdByTag(hubResultAzktcl.endpoint,
                                                          hubResultAzktcl.token,
                                                          namespace,
                                                          repository,
                                                          tag);

        chai.expect(result).to.not.be.undefined();
        done();
    });
  });

  it('should get all anscestor of an image id', function(done) {
    Q.spawn(function* () {
        // 2 - get info from docker registry
        var result = yield dockerRegistry.ancestry(hubResultAzktcl.endpoint,
                                                   hubResultAzktcl.token,
                                                   'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');

        chai.expect(result).to.have.length.above(7);
        done();
    });
  });

  it('should get all info about an image', function(done) {
    Q.spawn(function* () {
        // 2 - get info from docker registry
        var result = yield dockerRegistry.imageJson(hubResultAzktcl.endpoint,
                                                    hubResultAzktcl.token,
                                                    'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');

        chai.expect(result.id).to.eql('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
        chai.expect(result.os).to.eql('linux');
        done();
    });
  });

});
