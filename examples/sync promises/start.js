var DockerHub   = require('docker-registry-downloader').DockerHub;
var Syncronizer = require('docker-registry-downloader').Syncronizer;
var dockerHub   = new DockerHub();
var syncronizer = new Syncronizer();

var namespace   = 'azukiapp';
var repository  = 'azktcl';
var tag         = '0.0.2';
var outputPath  = __dirname + '/output';

// get token from DOCKER HUB API
dockerHub.images(namespace, repository).then(function(hubResult) {

  // sync registry layer with local layers
  return syncronizer.sync(hubResult, tag, outputPath);
});
