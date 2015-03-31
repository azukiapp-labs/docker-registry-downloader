var Docker = require('dockerode');
var fs     = require('fs');
var Q      = require('q');
var log    = require('../helpers/logger');
var path   = require('path');
var _      = require('lodash');

class DockerRemote {

  constructor(dockerode_options) {
    if (dockerode_options && dockerode_options.dockerode_modem) {
      this.docker = new Docker();
      this.docker.modem = dockerode_options.dockerode_modem;
    } else {
      var socket = process.env.DOCKER_SOCKET ||
                  (dockerode_options && dockerode_options.socket_dockerode) ||
                   '/var/run/docker.sock';

      var stats  = fs.statSync(socket);
      if (!stats.isSocket()) {
        throw new Error("Are you sure the docker is running?");
      }
      this.docker = new Docker({ socketPath: socket });
    }
  }

  listActiveContainers() {
    return new Q.Promise(function (resolve, reject) {
      try {

        this.docker.listContainers({all: false}, function(err, containers) {
          log.debug('\n\n:: docker-remote - listActiveContainers ::');
          log.debug(containers);
          resolve(containers);
        });

      } catch (err) {
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  listAllContainers() {
    return new Q.Promise(function (resolve, reject) {
      try {

        this.docker.listContainers({all: true}, function(err, containers) {
          log.debug('\n\n:: docker-remote - listAllContainers ::');
          log.debug(containers);
          resolve(containers);
        });

      } catch (err) {
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  listImages() {
    return new Q.Promise(function (resolve, reject) {
      try {

        this.docker.listImages(function(err, data) {
          log.debug('\n\n:: docker-remote - listImages ::');
          log.debug(data);
          resolve(data);
        });

      } catch (err) {
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  getImage(imageId) {
    return new Q.Promise(function (resolve, reject) {
      try {

        var image = this.docker.getImage(imageId);
        log.debug('\n\n:: docker-remote - image ::');
        log.debug(image);
        return resolve(image);

      } catch (err) {
        log.error(err);
        reject(err);
      }
    }.bind(this));
  }

  inspectImage(image) {
    return new Q.Promise(function (resolve, reject) {
      try {

        var handler = function (err, data) {
          if (err) {
            if (err.statusCode === 404) {
              return resolve(null); // does not exist, is null them
            }

            return reject(err);
          }

          log.debug('\n\n:: docker-remote - image inspect ::');
          log.debug(data);
          return resolve(data);
        };

        image.inspect(handler);

      } catch (err) {
        reject(err);
      }
    }.bind(this));
  }

  removeImage(imageId) {
    return Q.async(function* () {

      var image = yield this.getImage(imageId);

      var handler = function (err, data) {
        if (err) {
          throw err;
        }

        log.debug('\n\n:: docker-remote - removeImage ::');
        log.debug(data);
        return data;
      };

      image.remove(handler);

    }.bind(this))();
  }

  searchImages(imageName) {
    return new Q.Promise(function (resolve, reject) {
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

      } catch (err) {
        reject(err);
      }
    }.bind(this));
  }

  searchImagesByTag(tagName) {
    return Q.async(function* () {
      // get all images
      var allImages = yield this.listImages();

      // search tag
      var imagesFound = _.filter(allImages, function(image) {
        if (_.contains(image.RepoTags, tagName)) {
          return image;
        }
      }, this);

      log.debug('\n\n:: docker-remote - searchImagesByTag ::');
      log.debug(imagesFound);
      return imagesFound;
    }.bind(this))();
  }

  getParent(imageId) {
    return Q.async(function* () {
      var currentImage = yield this.getImage(imageId);
      var imageInspect = yield this.inspectImage(currentImage);

      if (imageInspect === null) {
        log.debug('\n\n:: docker-remote - getParent ::');
        log.debug('image not found: ' + imageId);
        return null;
      }

      log.debug('\n\n:: docker-remote - getParent ::');
      log.debug('image  ID: ' + imageId);
      log.debug('parent ID:   ' + imageInspect.Parent);
      return ({
        image        : currentImage,
        imageInspect : imageInspect
      });
    }.bind(this))();
  }

  anscestors(firstImageId) {
    return Q.async(function* () {
      var currentImageId = firstImageId;
      var anscestors = [];

      while (currentImageId) {
        var imageResult = yield this.getParent(currentImageId);

        if (imageResult === null) {
          log.debug('\n\n:: docker-remote - anscestors ::');
          log.debug('image not found: ' + currentImageId);
          return null;
        }

        anscestors.push(imageResult);
        currentImageId = imageResult.imageInspect.Parent;
      }

      log.debug('\n\n:: docker-remote - anscestors ::');
      var imageInspectors = _.pluck(anscestors, 'imageInspect');
      log.debug(_.pluck(imageInspectors, 'Id'));
      return anscestors;
    }.bind(this))();
  }

  loadImage(outputPath, imageId) {
    return new Q.Promise(function (resolve, reject) {
      try {

        var outputLoadPath = path.join(outputPath, imageId + '.tar');
        var handler = function (err/*, data*/) {
          if (err) {
            return reject(err);
          }

          log.debug('\n\n:: docker-remote - loadImage ::');
          log.debug(outputLoadPath);
          return resolve(outputLoadPath);
        };

        this.docker.loadImage(outputLoadPath, handler);

      } catch (err) {
        reject(err);
      }
    }.bind(this));
  }

  setImageTag(namespace, repository, imageId, tagName) {
    return Q.async(function* () {
      var image = yield this.docker.getImage(imageId);

      // check if the image exists
      var imageInspectResult = yield this.inspectImage(image);
      if (imageInspectResult === null) {
        log.debug('\n\n:: docker-remote - setImageTag ::');
        log.debug('no image found with ' + imageId);
        return null;
      }

      // tag local image
      image.tag({
        repo : namespace + '/' + repository,
        tag  : tagName,
        force: true
      }, function(err, data) {
        if (err) {
          throw err;
        }
        return data;
      });
    }.bind(this))();
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerRemote; }
};
