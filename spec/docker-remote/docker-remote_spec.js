require('source-map-support').install();
var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var path = require('path');
var log = require('../../src/helpers/logger');
var logError = require('../../src/helpers/error-helper');
Q.onerror = logError;

// import DockerHub from '../../src/docker-hub';
// import DockerRegistry from '../../src/docker-registry';
import DockerRemote from '../../src/docker-remote';

describe('Docker Remote API', function() {

  // var dockerHub = new DockerHub();
  // var dockerRegistry = new DockerRegistry();

  it('should get all containers', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.listAllContainers();
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should get only active containers', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.listActiveContainers();
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should list all images', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.listImages();
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should inpect one image', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var image = yield dockerRemote.getImage('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      var result = yield dockerRemote.inspectImage(image);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should searchImages from tag', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.searchImagesByTag('azukiapp/azktcl:0.0.2');
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should get parent image ID', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.getParent('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      chai.expect(result).to.not.be.undefined(result.Parent);
      done();
    });
  });

  it('should get all parents images ID', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.anscestors('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should load an image', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var filePath = path.join(__dirname, '../../..', 'spec/docker-registry/output/15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303.tar');
      var result = yield dockerRemote.loadImage(filePath);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
