import h           from '../spec_helper';
import DockerHub   from '../../src/docker-hub';
import { async }   from '../../src/helpers/promises';
var log = require('../../src/helpers/logger');

describe('Docker Hub API', function() {
  var dockerHub = new DockerHub();
  beforeEach(function() {
    dockerHub.request_options = {
      timeout: 20000,
      maxAttempts: 5,
      retryDelay: 500
    };
  });

  it('should authenticate the user and get the cookies', function(done) {
    //
    // run the tests like that to test auth:
    // DOCKER_USER=user_name DOCKER_PASS=escapade_password gulp test
    //
    var docker_user = process.env.DOCKER_USER;
    var docker_pass = process.env.DOCKER_PASS;

    if (!docker_user || !docker_pass) {
      log.info('    - DOCKER_USER and DOCKER_PASS envs not found. Ignoring this test. (see README)');
      return done();
    }

    return async(function* () {
      var result = yield dockerHub.auth('azukiapp', docker_user, docker_pass);
      h.expect(result).to.have.length(2);
      done();
    });
  });

  it('should search for azktcl', function(done) {
    return async(function* () {
      var result = yield dockerHub.search('azktcl');
      h.expect(result.results).to.have.length.above(0);
      h.expect(result.results[0].name).to.equal('azukiapp/azktcl');
      done();
    });
  });

  describe('errors', function () {

    it('should get 404 error', function(done) {
      return async(function* () {
        yield dockerHub.images('azukiapp', 'azktclNOEXIST');
      })
      .catch(function (err) {
        log.debug(err.message);
        done();
      });
    });

    it('should get timeout error', function(done) {
      return async(function* () {
        dockerHub.request_options = {
          timeout: 100,
          maxAttempts: 1,
          retryDelay: 50
        };
        yield dockerHub.images('azukiapp', 'azktcl');
      })
      .catch(function (err) {
        log.debug(err.message);
        done();
      });
    });

  });

  it('should get endpoind and token', function(done) {
    return async(function* () {
      var result = yield dockerHub.images('azukiapp', 'azktcl');
      h.expect(result.namespace).to.equal('azukiapp');
      h.expect(result.repository).to.equal('azktcl');
      h.expect(result.endpoint).to.not.be.undefined;
      h.expect(result.token).to.not.be.undefined;
      done();
    });
  });

});
