require('source-map-support').install();
var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
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
      chai.expect(result).to.have.length.above(20);
      done();
    });
  });

  it('should get only active containers', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.listActiveContainers();
      chai.expect(result).to.have.length.below(20);
      done();
    });
  });

  it('should list all images', function(done) {
    var dockerRemote = new DockerRemote();
    Q.spawn(function* () {
      var result = yield dockerRemote.listImages();

      /* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.      DEBUG */
        //           ------------------------------------------
        var target = result;
        //           ------------------------------------------
        var depth  = 2; var inspectResult=require("util").inspect(target,{showHidden:!0,colors:!0,depth:depth});console.log("\n>>------------------------------------------------------\n  ##  result\n  ------------------------------------------------------\n  source: ( "+__filename+" )"+"\n  ------------------------------------------------------\n"+inspectResult+"\n<<------------------------------------------------------\n");
      /* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-. /END-DEBUG */

      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
