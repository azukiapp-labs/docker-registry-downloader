docker-registry-downloader
==========================

Docker Registry Downloader

Tool to download individuals layer of docker registry.

### install
```shell
npm i docker-registry-downloader --save
```


### developer
```shell

# run all tests
gulp test

# enable "request" debug
NODE_DEBUG=request gulp test

# enable "REGISTRY" debug
REGISTRY_DEBUG_LEVEL=debug gulp test

# send authentication
DOCKER_USER=my_docker_user DOCKER_PASS=my_docker_escapade_password gulp test

# filter tests
gulp test --grep='Docker Registry API should tags from registry'
```

