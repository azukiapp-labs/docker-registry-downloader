var Q  = require('q');
var log = require('../helpers/logger');
var _ = require('lodash');
var prettyBytes = require('pretty-bytes');

import DockerHub from '../docker-hub';
import DockerRegistry from '../docker-registry';
import DockerRemote from '../docker-remote';

class Syncronizer {

	constructor() {
    this.dockerHub = new DockerHub();
		this.dockerRegistry = new DockerRegistry();
		this.dockerRemote = new DockerRemote();
  }

  compare(namespace, repository, tag) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {
          // get from docker registry
          var hubResult = yield this.dockerHub.images(namespace, repository);


          var imageId = yield this.dockerRegistry.getImageIdByTag(hubResult.endpoint,
                                                                  hubResult.token,
                                                                  namespace,
                                                                  repository,
                                                                  tag);

          var registryAncestors = yield this.dockerRegistry.ancestry(hubResult.endpoint,
                                                                     hubResult.token,
                                                                     imageId);

          // remove an image from local docker
          // yield this.dockerRemote.removeImage('aeae21d102569e871da86fd51ab8fd34ca12031a779ba6d02eea55a7f5123c10');

          // get from local docker
          var fullTagName = namespace + '/' + repository + ':' + tag;
          if (namespace === 'library') {
            fullTagName = repository + ':' + tag;
          }
          var imagesFound = yield this.dockerRemote.searchImagesByTag(fullTagName);

          if (!imagesFound || imagesFound.length === 0) {
            throw new Error('no local images found for ' + fullTagName);
          }

          var localAncestors = yield this.dockerRemote.anscestors(imagesFound[0].Id);
          var localImageInspectors = _.pluck(localAncestors, 'imageInspect');
          var localIds = _.pluck(localImageInspectors, 'Id');
          var diff = _.difference(registryAncestors, localIds);
          log.debug('\n\n:: syncronizer - compare registryAncestors ::');
          log.debug(registryAncestors);
          log.debug('\n\n:: syncronizer - compare localIds ::');
          log.debug(localIds);
          log.debug('\n\n:: syncronizer - compare diff ::');
          log.debug(diff);
          return resolve(diff);

        }.bind(this));

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

  getSizes(namespace, repository, hubResult, layersList) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {

          var totalSize = 0;
          for (var i=0; i < layersList.length; i++) {
              var layerID = layersList[i];
              var size = yield this.dockerRegistry.downloadImageGetSize(hubResult.endpoint,
                                                                        hubResult.token,
                                                                        layerID);
              totalSize = totalSize + size;
          }


          log.debug('\n\n:: syncronizer - getSizes ::');
          log.debug('layers:', layersList.length);
          log.debug('total size:', prettyBytes(totalSize));
          return resolve(totalSize);

        }.bind(this));

      } catch(err){
        reject(err);
      }
    }.bind(this));
  }


}

module.exports = {
  __esModule: true,
  get default() { return Syncronizer }
};
