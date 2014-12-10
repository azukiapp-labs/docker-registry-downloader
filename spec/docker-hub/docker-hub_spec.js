require('source-map-support').install();
var chai  = require('chai');
var Q  = require('q');
var logError = require('../../src/helpers/error-helper');
import DockerHub from '../../src/docker-hub';
Q.onerror = logError;

describe('Docker HUB API', function() {

  var dockerHub = new DockerHub();

  it('should authenticate the user and get the cookies', function(done) {
    //
    // run the tests like that to test auth:
    // DOCKER_USER=user_name DOCKER_PASS=escapade_password gulp test
    //
    var docker_user = process.env.DOCKER_USER;
    var docker_pass = process.env.DOCKER_PASS;

    if(!docker_user || !docker_pass) {
      return done();
    }

    Q.spawn(function* () {
      var result = yield dockerHub.auth('azukiapp', docker_user, docker_pass);
      chai.expect(result).to.have.length(2);
      done();
    });
  });

});
