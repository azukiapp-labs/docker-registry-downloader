var Docker = require('dockerode');
var fs     = require('fs');
var Q  = require('q');
var log = require('../helpers/logger');

class DockerRemote {

	constructor() {
		var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
		var stats  = fs.statSync(socket);

		if (!stats.isSocket()) {
		  throw new Error("Are you sure the docker is running?");
		}

		this.docker = new Docker({ socketPath: socket });
  }

 	listActiveContainers() {
    return new Q.Promise(function (resolve, reject, notify){
      try {

				this.docker.listContainers({all: false}, function(err, containers) {
				  resolve(containers);
				});

      } catch(err){
        reject(err);
      }
    }.bind(this));
	}

 	listAllContainers() {
    return new Q.Promise(function (resolve, reject, notify){
      try {

				this.docker.listContainers({all: true}, function(err, containers) {
				  resolve(containers);
				});

      } catch(err){
        reject(err);
      }
    }.bind(this));
	}

 	listImages() {
    return new Q.Promise(function (resolve, reject, notify){
      try {

				this.docker.listImages(function(err, data) {
				  resolve(data);
				});

      } catch(err){
        reject(err);
      }
    }.bind(this));
	}

}

module.exports = {
  __esModule: true,
  get default() { return DockerRemote }
};
