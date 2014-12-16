require('source-map-support').install();
var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var log = require('../../src/helpers/logger');
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

  before(function(done){
    this.timeout(10000);
    // 1 - get endpoint and token
    Q.spawn(function* () {
      var namespace = 'azukiapp';
      var repository = 'azktcl';
      hubResultAzktcl = yield dockerHub.images(namespace, repository);
      done();
    });
  });



  it('should get tags from azukiapp/azktcl', function(done) {
    Q.spawn(function* () {

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

      var result = yield dockerRegistry.ancestry(hubResultAzktcl.endpoint,
                                                 hubResultAzktcl.token,
                                                 'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');

      chai.expect(result).to.have.length.above(7);
      done();
    });
  });

  it('should get all info about an image', function(done) {
    Q.spawn(function* () {

      var result = yield dockerRegistry.imageJson(hubResultAzktcl.endpoint,
                                                  hubResultAzktcl.token,
                                                  '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');

      chai.expect(result.id).to.eql('15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');
      chai.expect(result.os).to.eql('linux');
      done();
    });
  });

  it('should get all anscestors layers for azktcl tag', function(done) {
    this.timeout(5000);
    Q.spawn(function* () {
      var namespace = 'azukiapp';
      var repository = 'azktcl';
      var tag = '0.0.2';

      var result = yield dockerRegistry.allAnscestorByTag(hubResultAzktcl.endpoint,
                                                          hubResultAzktcl.token,
                                                          namespace,
                                                          repository,
                                                          tag);

      chai.expect(result).to.have.length.above(7);
      done();
    });
  });

  it('should get download size only', function(done) {
    this.timeout(30000); // 30 seconds
    Q.spawn(function* () {
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var result = yield dockerRegistry.downloadImageGetSize(hubResultAzktcl.endpoint,
                                                             hubResultAzktcl.token,
                                                             imageId_5);

      chai.expect(result).to.eql(3069677);
      done();
    });
  });

  it('should get image layer download stream', function(done) {
    Q.spawn(function* () {
      // var imageId_7 = '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158';
      // var imageId_7_Size = ' 10.24 kB';
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var imageId_5_Size = ' 3.07 MB';
      var result = yield dockerRegistry.downloadImage(hubResultAzktcl.endpoint,
                                                      hubResultAzktcl.token,
                                                      'spec/docker-registry/output',
                                                      imageId_5);

      chai.expect(result).to.eql(imageId_5 + imageId_5_Size);
      done();
    });
  });

  it('should create a folder ready to load', function(done) {
    this.timeout(15000); // 15 seconds
    Q.spawn(function* () {

      var namespace = 'azukiapp';
      var repository = 'azktcl';
      var tag = '0.0.2';
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';

      var opts = {
        endpoint  : hubResultAzktcl.endpoint,
        token     : hubResultAzktcl.token,
        namespace : namespace,
        repository: repository,
        tag       : tag,
        outputPath: 'spec/docker-registry/output',
        imageId   : imageId_5,
      };

      var result = yield dockerRegistry.prepareLoading(opts);

      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
