import h from '../spec_helper';
import fsAsync        from '../../src/helpers/file_async';
import DockerHub      from '../../src/docker-hub';
import DockerRegistry from '../../src/docker-registry';
import { async, nfcall }   from '../../src/helpers/promises';
var path     = require('path');

describe('Docker Registry API', function() {

  var dockerHub = new DockerHub();
  var dockerRegistry = new DockerRegistry();
  var hubResultAzktcl = {
    endpoint: null,
    token:    null
  };

  before(function() {
    this.timeout(10000);
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

  it('should get timeout error', function(done) {
    return async(function* () {
      try {

        dockerRegistry.request_options =  {
          timeout: 100,
          maxAttempts: 1,
          retryDelay: 50
        };

        yield dockerRegistry.tags(hubResultAzktcl);
        done('should get error: ETIMEDOUT');
      }
      catch (err) {
        h.expect(err.code).to.equal('ETIMEDOUT');
        done();
      }
    });
  });

  it('should get tags from library/node', function(done) {
    return async(function* () {
      // 1 - get endpoint and token
      var namespace = 'library';
      var repository = 'node';
      var hubResultNode = yield dockerHub.images(namespace, repository);

      dockerRegistry.request_options = {
        timeout: 20000,
        maxAttempts: 5,
        retryDelay: 500
      };
      var result = yield dockerRegistry.tags(hubResultNode);

      h.expect(result).to.include.keys('0.8');
      h.expect(result).to.include.keys('0.10');
      h.expect(result).to.include.keys('0.11');
      h.expect(result).to.include.keys('latest');
      done();
    });
  });

  it('should get image id by tag name', function(done) {
    return async(function* () {
      var tag = '0.0.1';

      var result = yield dockerRegistry.getImageIdByTag(hubResultAzktcl,
                                                        tag);

      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should get all anscestor of an image id', function(done) {
    return async(function* () {

      var result = yield dockerRegistry.ancestry(hubResultAzktcl,
        'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');

      h.expect(result).to.have.length.above(7);
      done();
    });
  });

  it('should get all info about an image', function(done) {
    return async(function* () {

      var result = yield dockerRegistry.imageJson(hubResultAzktcl,
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');

      h.expect(result.id).to.eql('15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');
      h.expect(result.os).to.eql('linux');
      done();
    });
  });

  it('should get all anscestors layers for azktcl tag', function(done) {
    this.timeout(5000);
    return async(function* () {
      var tag = '0.0.2';

      var result = yield dockerRegistry.allAnscestorByTag(hubResultAzktcl, tag);

      h.expect(result).to.have.length.above(7);
      done();
    });
  });

  it('should get download size only', function(done) {
    this.timeout(3000); // 30 seconds
    return async(function* () {
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var result = yield nfcall(dockerRegistry.downloadImageGetSize(hubResultAzktcl, imageId_5));

      h.expect(result).to.eql(3069677);
      done();
    });
  });

  it('should get image layer download stream', function(done) {
    this.timeout(15000); // 15 seconds
    return async(function* () {
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var outputFolder = 'spec/docker-registry/output/15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var outputFile = 'layer.tar';
      var fullPath = path.join(outputFolder, outputFile);

      // create output clean folder
      yield fsAsync.remove(outputFolder);
      yield fsAsync.mkdirp(outputFolder);

      // download
      var result = yield dockerRegistry.downloadImage(hubResultAzktcl,
                                                      fullPath,
                                                      imageId_5);

      h.expect(result).to.eql(fullPath);
      done();
    });
  });

  it('should create a folder ready to load', function(done) {
    this.timeout(15000); // 15 seconds
    return async(function* () {

      var result = yield dockerRegistry.prepareLoading(
        hubResultAzktcl,
        __dirname + '/../../../spec/docker-registry/output',
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');

      h.expect(result).to.not.be.undefined;
      done();
    });
  });

});
