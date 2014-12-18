require('source-map-support').install();
var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var log = require('../../src/helpers/logger');
var path = require('path');
var logError = require('../../src/helpers/error-helper');
import FsHelper from '../../src/fs-helper';
var fsHelper = new FsHelper();
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

  before(function() {
    this.timeout(10000);
    // 1 - get endpoint and token
    return Q.async(function* () {
      var namespace = 'azukiapp';
      var repository = 'azktcl';
      hubResultAzktcl = yield dockerHub.images(namespace, repository);
      // done();
    })();
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
    this.timeout(3000); // 30 seconds
    Q.spawn(function* () {
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var result = yield Q.nfcall(dockerRegistry.downloadImageGetSize(
                                    hubResultAzktcl.endpoint,
                                    hubResultAzktcl.token,
                                    imageId_5));

      chai.expect(result).to.eql(3069677);
      done();
    });
  });

  it('should get image layer download stream', function(done) {
    Q.spawn(function* () {
      var imageId_5 = '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var outputFolder = 'spec/docker-registry/output/15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303';
      var outputFile = 'layer.tar';
      var fullPath = path.join(outputFolder, outputFile);

      // create output clean folder
      yield fsHelper.createCleanFolder(outputFolder);

      // download
      var result = yield dockerRegistry.downloadImage(hubResultAzktcl.endpoint,
                                                      hubResultAzktcl.token,
                                                      fullPath,
                                                      imageId_5);

      chai.expect(result).to.eql(fullPath);
      done();
    });
  });

  it('should create a folder ready to load', function(done) {
    this.timeout(15000); // 15 seconds
    Q.spawn(function* () {

      var result = yield dockerRegistry.prepareLoading(
        hubResultAzktcl.endpoint,
        hubResultAzktcl.token,
        __dirname + '/../../../spec/docker-registry/output',
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303');

      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
