var Docker = require('dockerode');
var fs     = require('fs');
var Q  = require('q');
var log = require('../helpers/logger');
var _ = require('lodash');

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
          log.debug('\n\n:: docker-remote - listActiveContainers ::');
          log.debug(containers);
				  resolve(containers);
				});

      } catch(err){
        log.error(err);
        reject(err);
      }
    }.bind(this));
	}

 	listAllContainers() {
    return new Q.Promise(function (resolve, reject, notify){
      try {

				this.docker.listContainers({all: true}, function(err, containers) {
          log.debug('\n\n:: docker-remote - listAllContainers ::');
          log.debug(containers);
				  resolve(containers);
				});

      } catch(err){
        log.error(err);
        reject(err);
      }
    }.bind(this));
	}

  listImages() {
    return new Q.Promise(function (resolve, reject, notify){
      try {

        this.docker.listImages(function(err, data) {
          log.debug('\n\n:: docker-remote - listImages ::');
          log.debug(data);
          resolve(data);
        });

      } catch(err){
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  getImage(imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      try {

        var image = this.docker.getImage(imageId);
        log.debug('\n\n:: docker-remote - image ::');
        log.debug(image);
        return resolve(image);

      } catch(err){
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  inspectImage(image) {
    return new Q.Promise(function (resolve, reject, notify){
      try {

        var handler = function (err, data) {
          if (err) {
            return reject(err);
          }

          log.debug('\n\n:: docker-remote - image inspect ::');
          log.debug(data);
          return resolve(data);
        };

        image.inspect(handler);

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

  removeImage(imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {

          var image = yield this.getImage(imageId);

          var handler = function (err, data) {
            if (err) {
              return reject(err);
            }

            log.debug('\n\n:: docker-remote - removeImage ::');
            log.debug(data);
            return resolve(data);
          };

          image.remove(handler);

        }.bind(this));

      } catch(err){
        reject(err);
      }
    }.bind(this));


    return new Q.Promise(function (resolve, reject, notify){
      try {

        var image = this.getImage(imageId);
        log.debug('\n\n:: docker-remote - removeImage ::');
        log.debug(image);

        var handler = function (err, data) {
          if (err) {
            return reject(err);
          }

          log.debug('\n\n:: docker-remote - image inspect ::');
          log.debug(data);
          return resolve(data);
        };

        image.inspect(handler);

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

 	searchImages(imageName) {
    return new Q.Promise(function (resolve, reject, notify){
      try {

        var handler = function (err, data) {
          if (err) {
            return reject(err);
          }

          log.debug('\n\n:: docker-remote - searchImages ::');
          log.debug(data);
          return resolve(data);
        };

				this.docker.searchImages({ term: imageName }, handler);

      } catch(err){
        reject(err);
      }
    }.bind(this));
	}

  searchImagesByTag(tagName) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {

          // get all images
          var allImages = yield this.listImages();

          // search tag
          var imagesFound = _.filter(allImages, function(image) {
            if (_.contains(image.RepoTags, tagName)){
              return image;
            }
          }, this);

          log.debug('\n\n:: docker-remote - searchImagesByTag ::');
          log.debug(imagesFound);
          resolve(imagesFound);

        }.bind(this));
      } catch(ex){
        reject(ex);
      }
    }.bind(this));
  }

  getParent(imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {

          var currentImage = yield this.getImage(imageId);
          var imageInspect = yield this.inspectImage(currentImage);
          log.debug('\n\n:: docker-remote - getParent ::');
          log.debug('image  ID: ' + imageId);
          log.debug('parent ID:   ' + imageInspect.Parent);
          return resolve({
            image        : currentImage,
            imageInspect : imageInspect
          });

        }.bind(this));

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

  anscestors(firstImageId) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {
          var currentImageId = firstImageId;
          var anscestors = [];

          while (currentImageId) {
            var imageResult = yield this.getParent(currentImageId);
            anscestors.push(imageResult);
            currentImageId = imageResult.imageInspect.Parent;
          }

          log.debug('\n\n:: docker-remote - anscestors ::');
          var imageInspectors = _.pluck(anscestors, 'imageInspect');
          log.debug(_.pluck(imageInspectors, 'Id'));
          return resolve(anscestors);

        }.bind(this));

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

  loadImage(file) {
    return new Q.Promise(function (resolve, reject, notify){
      try {

        var handler = function (err, data) {
          if (err) {
            return reject(err);
          }

          log.debug('\n\n:: docker-remote - loadImage ::');
          log.debug(data);
          return resolve(data);
        };

        this.docker.loadImage(file, handler);

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
