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

  it('should get tags from azukiapp/azktcl', function(done) {
    Q.spawn(function* () {
        // 1 - get endpoint and token
        var dockerHubResult = yield dockerHub.images('azukiapp', 'azktcl');

        // 2 - get info from docker registry
        var result = yield dockerRegistry.tags(dockerHubResult.endpoint,
                                               dockerHubResult.token,
                                               'azukiapp',
                                               'azktcl');

        chai.expect(result).to.include.keys('0.0.1');
        chai.expect(result).to.include.keys('0.0.2');
        done();
    });
  });

  it('should get tags from library/node', function(done) {
    Q.spawn(function* () {
        var namespace = 'library';
        var repository = 'node';

        // 1 - get endpoint and token
        var dockerHubResult = yield dockerHub.images(namespace, repository);

        // 2 - get info from docker registry
        var result = yield dockerRegistry.tags(dockerHubResult.endpoint,
                                               dockerHubResult.token,
                                               namespace,
                                               repository);

        chai.expect(result).to.include.keys('0.8');
        chai.expect(result).to.include.keys('0.10');
        chai.expect(result).to.include.keys('0.11');
        chai.expect(result).to.include.keys('latest');
        done();
    });
  });

});
