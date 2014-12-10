registry-downloader
===================

Docker Registry Downloader Helper

```shell

# run all tests
gulp test

# enable "request" debug
NODE_DEBUG=request gulp test

# send authentication
DOCKER_USER=my_docker_user DOCKER_PASS=my_docker_escapade_password gulp test

# filter tests
gulp test --grep='Docker Registry API should tags from registry'
```

