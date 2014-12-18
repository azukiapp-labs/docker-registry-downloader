Docker Registry Downloader
==========================

Syncronize images from Docker Registry with your local Docker images.
Works just like `docker pull` but better because is faster.

### install
```shell
npm i docker-registry-downloader --save
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

