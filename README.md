Docker Registry Downloader
==========================

This package provides several helpers to use Docker APIs.


- Syncronize images from Docker Registry with your local Docker images.
  - works just like new implementation of `docker pull` downloading severals layers in parallel.
- Compare local layers with registry layers


### Quick-start sample app

```sh
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

----------------

### install as a lib
```sh
npm i docker-registry-downloader --save
```

----------------

### install npm module globally
```sh
[sudo] npm i docker-registry-downloader -g

# usage example
registrySync library/ruby:latest -o /var/tmp
```

----------------

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

----------------

### dev

#### run all tests

```sh
gulp
```

#### filter tests

```sh
gulp --grep='should sync azukiapp/azktcl:0.0.2'
```

#### enable "request" debug

```sh
export NODE_DEBUG=request
```

#### enable "REGISTRY" debug

```sh
export DOCKER_REGISTRY_DEBUG_LEVEL=debug
```

#### send authentication

```sh
export DOCKER_USER=my_docker_user DOCKER_PASS=my_docker_escapade_password
```
