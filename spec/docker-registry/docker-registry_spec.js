import h from '../spec_helper';
import DockerHub      from '../../src/docker-hub';
import DockerRegistry from '../../src/docker-registry';
import { async }   from '../../src/helpers/promises';

describe('Docker Registry API', function() {
  this.timeout(22000);

  var dockerHub = new DockerHub();
  var dockerRegistry = new DockerRegistry();
  var hubResultAzktcl = {
    endpoint: null,
    token:    null
  };

  before(function() {
    // 1 - get endpoint and token
    return async(function* () {
      var namespace = 'azukiapp';
      var repository = 'azktcl';
      hubResultAzktcl = yield dockerHub.images(namespace, repository);
    });
  });

  beforeEach(function() {
    dockerRegistry.request_options = {
      timeout: 20000,
      maxAttempts: 5,
      retryDelay: 500
    };
  });

  it('should get tags from azukiapp/azktcl', function(done) {
    return async(function* () {

      var result = yield dockerRegistry.tags(hubResultAzktcl);

      h.expect(result).to.include.keys('0.0.1');
      h.expect(result).to.include.keys('0.0.2');
      done();
    });
  });

  it('should get timeout error', function() {
    return async(function* () {
      try {

        dockerRegistry.request_options =  {
          timeout: 100,
          maxAttempts: 1,
          retryDelay: 50
        };

        yield dockerRegistry.tags(hubResultAzktcl);
      }
      catch (err) {
        h.expect(err.code).to.equal('ETIMEDOUT');
      }
    });
  });

  it('should get tags from library/node', function() {
    this.timeout(40000);
    return async(function* () {
      // 1 - get endpoint and token
      var namespace = 'library';
      var repository = 'node';
      var hubResultNode = yield dockerHub.images(namespace, repository);

      dockerRegistry.request_options = {
        timeout: 40000,
        maxAttempts: 5,
        retryDelay: 500
      };
      var result = yield dockerRegistry.tags(hubResultNode);

      h.expect(result).to.include.keys('0.8');
      h.expect(result).to.include.keys('0.10');
      h.expect(result).to.include.keys('0.11');
      h.expect(result).to.include.keys('latest');
    });
  });

  it('should get image id by tag name', function() {
    return async(function* () {
      var tag = '0.0.1';
      var result = yield dockerRegistry.getImageIdByTag(hubResultAzktcl,
                                                        tag);
      h.expect(result).to.not.be.undefined;
    });
  });

  it('should get all anscestor of an image id', function() {
    return async(function* () {
      var result = yield dockerRegistry.ancestry(hubResultAzktcl,
        'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      h.expect(result).to.have.length.above(7);
    });
  });

  it('should get all info about an image', function() {
    return async(function* () {
      var result = yield dockerRegistry.imageJson(hubResultAzktcl,
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');

      h.expect(result.id).to.eql('15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');
      h.expect(result.os).to.eql('linux');
    });
  });

  it('should get all anscestors layers for azktcl tag', function() {
    this.timeout(20000);
    var tag = '0.0.2';
    return dockerRegistry.allAnscestorByTag(hubResultAzktcl, tag).then(function (result) {
      return h.expect(result).to.have.length.above(7);
    });
  });

});
