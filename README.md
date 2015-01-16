Docker Registry Downloader
==========================

Syncronize images from Docker Registry with your local Docker images. Works just like new implementation of `docker pull` downloading severals layers in parallel.

### Quick-start sample app
```shell
# clone this repo
git clone git@github.com:azukiapp/docker-registry-downloader.git

# go to the "sync promises example" folder
cd "docker-registry-downloader/examples/sync promises"

# npm install
npm i

# remove azukiapp/azktcl:0.0.2 if exist
docker rmi -f azukiapp/azktcl:0.0.2

# run example
node start.js
```

### install as a lib
```shell
npm i docker-registry-downloader --save
```

### install npm module globally
```shell
[sudo] npm i docker-registry-downloader -g

# usage example
registrySync library/ruby:latest -o /var/tmp
```

### usage
```javascript
var DockerHub   = require('docker-registry-downloader').DockerHub;
var Syncronizer = require('docker-registry-downloader').Syncronizer;
var dockerHub   = new DockerHub();
var syncronizer = new Syncronizer();

var namespace   = 'azukiapp';
var repository  = 'azktcl';
var tag         = '0.0.2';
var outputPath  = '/tmp'; // this folder must exist

// get token from DOCKER HUB API
dockerHub.images(namespace, repository).then(function(hubResult) {

  // sync registry layer with local layers
  return syncronizer.sync(hubResult, tag, outputPath);
});
```


### developer

```shell
# run all tests (slow)
gulp test

# filter tests
gulp test --grep='should sync azukiapp/azktcl:0.0.2'

# enable "request" debug
NODE_DEBUG=request gulp test

# enable "REGISTRY" debug
DOCKER_REGISTRY_DEBUG_LEVEL=debug gulp test

# send authentication
DOCKER_USER=my_docker_user DOCKER_PASS=my_docker_escapade_password gulp test
```

