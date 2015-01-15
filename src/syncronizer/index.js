var Q  = require('q');
var log = require('../helpers/logger');
var _ = require('lodash');
var prettyBytes = require('pretty-bytes');
var async = require('async');
var ProgressBar = require('progress');

import DockerHub from '../docker-hub';
import DockerRegistry from '../docker-registry';
import DockerRemote from '../docker-remote';

class Syncronizer {

	constructor() {
    this.dockerHub = new DockerHub();
		this.dockerRegistry = new DockerRegistry();
		this.dockerRemote = new DockerRemote();
  }

  compare(hubResult, tag) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        Q.spawn(function* () {
          // get endpoint and token from docker hub
          var imageId = yield this.dockerRegistry.getImageIdByTag(hubResult, tag);

          var registryAncestors = yield this.dockerRegistry.ancestry(hubResult, imageId);

          // get from local docker
          var fullTagName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
          if (hubResult.namespace === 'library') {
            fullTagName = hubResult.repository + ':' + tag;
          }
          var imagesFound = yield this.dockerRemote.searchImagesByTag(fullTagName);

          if (!imagesFound || imagesFound.length === 0) {
            //throw new Error('no local images found for ' + fullTagName);
            log.debug('\n\n:: syncronizer - compare - no local image for '+ fullTagName +' ::');
            log.debug(registryAncestors);
            return resolve(registryAncestors);
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

      } catch(err) {
        reject(err);
      }
    }.bind(this));
  }

  getSizes(hubResult, layersList) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        var allChecks = [];

        for (var i=0; i < layersList.length; i++) {
            var layerID = layersList[i];
            allChecks.push(this.dockerRegistry.downloadImageGetSize(hubResult, layerID));
        }

        async.parallelLimit(allChecks, 10,
        function(err, results) {

          var totalSize = _.reduce(results, function(sum, num) {
            return sum + num;
          }, 0);

          log.debug('\n\n:: syncronizer - getSizes ::');
          log.debug('layers:', layersList.length);

          return resolve(totalSize);
        });
      } catch(err) {
        reject(err);
      }
    }.bind(this));
  }

  downloadCallback(hubResult, outputPath, imageId, iProgress) {
    return function (callback) {
      Q.spawn(function* () {
        callback(null, yield this.dockerRegistry.prepareLoading(
          hubResult, outputPath, imageId, iProgress));
      }.bind(this));
    }.bind(this);
  }

  loadCallback(hubResult, outputPath, imageId) {
    return function (callback) {
      Q.spawn(function* () {
        var result = yield this.dockerRemote.loadImage(outputPath, imageId);
        callback(null, result);
      }.bind(this));
    }.bind(this);
  }

  // endpoint    : docker registry endpoint from dockerhub
  // token       : repository token         from dockerhub
  // outputPath  : local folder to save
  // imageIdList : all IDs to download
  downloadList(hubResult, outputPath, imageIdList, iProgress) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        var allDownloads = [];

        for (var i=imageIdList.length-1; i >= 0 ; i--) {
          var layerID = imageIdList[i];
          allDownloads.push(this.downloadCallback(hubResult, outputPath, layerID, iProgress));
        }

        // download
        async.parallelLimit(allDownloads, 6,
          function(err, results) {
            log.debug('\n\n:: syncronizer - downloadAndLoadList ::');
            log.debug('outputs:', results);

            resolve(results);
          }
        );
      } catch(err) {
        reject(err);
      }

    }.bind(this));
  }

  loadList(hubResult, outputPath, imageIdList) {
    // opts: {
    //   endpoint    : docker registry endpoint from dockerhub
    //   token       : repository token         from dockerhub
    //   outputPath  : local folder to save
    //   imageIdList : all IDs to download
    // }
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        var allLoads = [];

        for (var i=imageIdList.length-1; i >= 0 ; i--) {
          var layerID = imageIdList[i];
          allLoads.push(this.loadCallback(hubResult, outputPath, layerID));
        }

        // load
        async.parallelLimit(allLoads, 1,
          function(err, results) {
            log.debug('\n\n:: syncronizer - downloadAndLoadList ::');
            log.debug('outputs:', results);

            return resolve(results);
          }
        );
      } catch(err) {
        reject(err);
      }

    }.bind(this));
  }

  setTags(hubResult) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        Q.spawn(function* () {

          // get all tags
          var tags = yield this.dockerRegistry.tags(hubResult);
          var results = [];
          for(var name in tags)
          {
              if (tags.hasOwnProperty(name))
              {
                var tagName = name;
                var imageId = tags[name];

                log.debug('\n\n:: syncronizer - setTag - search image ::');
                log.debug(tagName, imageId);
                var result = yield this.dockerRemote.setImageTag(hubResult.namespace, hubResult.repository, imageId, tagName);
                results.push(result);
              }
          }

          resolve(results);

        }.bind(this));
      } catch(err) {
        reject(err);
      }
    }.bind(this));

  }

  sync(hubResult, tag, outputPath) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        Q.spawn(function* () {

          var imageFullName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
          log.info('syncing', imageFullName);
          log.info('  comparing docker registry with local images...');
          var layersToDownload = yield this.compare(hubResult, tag);

          log.info('  getting total size...');
          var totalSize = yield this.getSizes(hubResult, layersToDownload);

          if (totalSize > 0) {
            log.info('  downloading ' + layersToDownload.length + ' layers ' + prettyBytes(totalSize) + '...');

            var progressMessage = '        [:bar] :percent ( time elapsed: :elapsed seconds )';
            var bar = new ProgressBar(progressMessage, {
              complete: '=',
              incomplete: ' ',
              width: 23,
              total: totalSize
            });

            var iProgress = function(chunkSize) {
              bar.tick(chunkSize);
            };

            yield this.downloadList(hubResult, outputPath, layersToDownload, iProgress);

            log.info('  loading all layers...');
            yield this.loadList(hubResult, outputPath, layersToDownload);
          }
          else{
            log.info('  nothing to download');
          }

          log.info('  setting tags...');
          yield this.setTags(hubResult);

          log.info('finished loading', imageFullName);

          resolve(true);

        }.bind(this));
      } catch(err) {
        reject(err);
      }
    }.bind(this));

  }


}

module.exports = {
  __esModule: true,
  get default() { return Syncronizer }
};
