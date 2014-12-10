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

  it('should tags from registry', function(done) {
    Q.spawn(function* () {
        // 1 - get endpoint and token
        var dockerHubResult = yield dockerHub.images('azukiapp', 'azktcl');

        // 2 - get info from docker registry
        var result = yield dockerRegistry.tags(dockerHubResult.endpoint,
                                               dockerHubResult.token,
                                               'azukiapp',
                                               'azktcl');

        var keys = _.keys(result);
        chai.expect(keys).to.have.length(2);
        done();
    });
  });

});
