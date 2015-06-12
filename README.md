Docker Registry Downloader
==========================

This package provides several helpers to use Docker APIs.

- Compare local layers with registry layers

### Install

----------------

```sh
npm i docker-registry-downloader --save
```

----------------

### Usage example

```javascript
var DockerHub   = require('docker-registry-downloader').DockerHub;
var Syncronizer = require('docker-registry-downloader').Syncronizer;
var dockerHub   = new DockerHub();
var syncronizer = new Syncronizer();

syncronizer.initialize().then(function() {
  var namespace   = 'azukiapp';
  var repository  = 'azktcl';
  var tag         = '0.0.2';

  // get token from Docker Hub API
  dockerHub.images(namespace, repository).then(function(hubResult) {
    // check local layers with Docker Registry API
    return syncronizer.getLayersDiff(hubResult, tag).then(function (result) {
      console.log(result);
    });
  });
});

```

----------------

### developers come here

#### run all tests

```sh
gulp
```

#### filter tests

```sh
gulp --grep='should sync azukiapp/azktcl:0.0.2'
```

#### enable debug

```sh
export DOCKER_REGISTRY_DEBUG_LEVEL=debug
```

#### enable request debug

```sh
export NODE_DEBUG=request
```
