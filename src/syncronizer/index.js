import DockerHub      from '../docker-hub';
import DockerRegistry from '../docker-registry';
import DockerRemote   from '../docker-remote';
import FsHelper       from '../fs-helper';

var path        = require('path');
var Q           = require('q');
var log         = require('../helpers/logger');
var _           = require('lodash');
var prettyBytes = require('pretty-bytes');
var async       = require('async');
var ProgressBar = require('progress');
var os          = require('os');
var fsHelper    = new FsHelper();

Q.onerror = function(title, err) {
  log.error('\n\n', title, err);
  throw err;
};

class Syncronizer {

  constructor(dockerode_options, request_options) {
    this.dockerHub = new DockerHub(request_options);
    this.dockerRegistry = new DockerRegistry(request_options);
    this.dockerRemote = new DockerRemote(dockerode_options);
  }

  compare(hubResult, tag) {
    return Q.async(function* () {
      // get endpoint and token from docker hub
      var imageId = yield this.dockerRegistry.getImageIdByTag(hubResult, tag);

      var registryAncestors = yield this.dockerRegistry.ancestry(hubResult, imageId);
      log.info('  registry layers count:', registryAncestors.length);

      // get from local docker
      var fullTagName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
      if (hubResult.namespace === 'library') {
        fullTagName = hubResult.repository + ':' + tag;
      }
      var imagesFound = yield this.dockerRemote.searchImagesByTag(fullTagName);

      if (!imagesFound || imagesFound.length === 0) {
        //throw new Error('no local images found for ' + fullTagName);
        log.debug('\n\n:: syncronizer - compare - no local image for ' + fullTagName + ' ::');
        log.debug(registryAncestors);
        log.info('  local layers found   :', 0);
        return registryAncestors;
      }

      var localAncestors = yield this.dockerRemote.anscestors(imagesFound[0].Id);
      log.info('    local layers found:', localAncestors.length);
      var localImageInspectors = _.pluck(localAncestors, 'imageInspect');

      var localIds = _.pluck(localImageInspectors, 'Id');
      var diff = _.difference(registryAncestors, localIds);
      log.debug('\n\n:: syncronizer - compare registryAncestors ::');
      log.debug(registryAncestors);
      log.debug('\n\n:: syncronizer - compare localIds ::');
      log.debug(localIds);
      log.debug('\n\n:: syncronizer - compare diff ::');
      log.debug(diff);
      log.info('    diff images:', diff.length);
      return diff;
    }.bind(this))();
  }

  getSizes(hubResult, layersList) {
    return new Q.Promise(function (resolve, reject) {
      try {
        var allChecks = [];

        for (var i = 0; i < layersList.length; i++) {
          var layerID = layersList[i];
          allChecks.push(this.dockerRegistry.downloadImageGetSize(hubResult, layerID));
        }

        async.parallelLimit(allChecks, 10,
        function(err, results) {
          if (err) {
            return reject(err);
          }

          var totalSize = _.reduce(results, function(sum, num) {
            return sum + num;
          }, 0);

          log.debug('\n\n:: syncronizer - getSizes ::');
          log.debug('layers:', layersList.length);

          return resolve(totalSize);
        });
      } catch (err) {
        log.error(err.stack);
        reject(err);
      }
    }.bind(this));
  }

  checkDownloadedFiles(layersList, outputPath) {
    return Q.async(function* () {

      var layerToDownload = [];

      for (var i = 0; i < layersList.length; i++) {
        var layerID = layersList[i];
        var filename = path.join(outputPath, layerID + '.tar');
        var fileExists = yield fsHelper.fsExists(filename);
        if (!fileExists) {
          layerToDownload.push(layerID);
        }
      }

      return layerToDownload;
    }.bind(this))();
  }

  downloadCallback(hubResult, outputPath, imageId, iProgress) {
    return function (callback) {
      try {
        Q.spawn(function* () {
          callback(null, yield this.dockerRegistry.prepareLoading(
            hubResult, outputPath, imageId, iProgress));
        }.bind(this));
      } catch (err) {
        log.error(err.stack);
      }
    }.bind(this);
  }

  loadCallback(hubResult, outputPath, imageId, iProgress) {
    return function (callback) {
      Q.async(function* () {
        var result = yield this.dockerRemote.loadImage(outputPath, imageId);
        if (iProgress) {
          iProgress(1);
        }
        callback(null, result);
      }.bind(this))();
    }.bind(this);
  }

  // endpoint    : docker registry endpoint from dockerhub
  // token       : repository token         from dockerhub
  // outputPath  : local folder to save
  // imageIdList : all IDs to download
  downloadList(hubResult, outputPath, imageIdList, iProgress) {
    return new Q.Promise(function (resolve, reject) {
      try {
        var allDownloads = [];

        for (var i = (imageIdList.length - 1); i >= 0 ; i--) {
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
      } catch (err) {
        log.error(err.stack);
        reject(err);
      }

    }.bind(this));
  }

  loadList(hubResult, outputPath, imageIdList, iProgress) {
    // opts: {
    //   endpoint    : docker registry endpoint from dockerhub
    //   token       : repository token         from dockerhub
    //   outputPath  : local folder to save
    //   imageIdList : all IDs to download
    // }
    return new Q.Promise(function (resolve, reject) {
      try {
        var allLoads = [];

        for (var i = (imageIdList.length - 1); i >= 0 ; i--) {
          var layerID = imageIdList[i];
          allLoads.push(this.loadCallback(hubResult, outputPath, layerID, iProgress));
        }

        // load
        async.parallelLimit(allLoads, 1,
          function(err, results) {
            log.debug('\n\n:: syncronizer - downloadAndLoadList ::');
            log.debug('outputs:', results);

            return resolve(results);
          }
        );
      } catch (err) {
        log.error(err.stack);
        reject(err);
      }

    }.bind(this));
  }

  setTags(hubResult) {
    return Q.async(function* () {

      // get all tags
      var tags = yield this.dockerRegistry.tags(hubResult);
      var results = [];
      for (var name in tags) {
        if (tags.hasOwnProperty(name)) {
          var tagName = name;
          var imageId = tags[name];

          log.debug('\n\n:: syncronizer - setTag - search image ::');
          log.debug(tagName, imageId);
          var result = yield this.dockerRemote.setImageTag(hubResult.namespace,
                                                           hubResult.repository,
                                                           imageId,
                                                           tagName);
          results.push(result);
        }
      }

      return results;
    }.bind(this))();

  }

  sync(hubResult, tag, outputPath, forceOverwrite) {
    var progressMessage, bar, iProgress;
    return Q.async(function* () {

      if (!outputPath) {
        // no folder was sent, set to /tmp
        outputPath = this.getOsTempDir();
        log.info('creating temp folder', outputPath);
        yield this.createAndCleanTempDir(outputPath);
      }

      var imageFullName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
      log.info('syncing', imageFullName);
      log.info('  comparing docker registry with local images...');
      // compare all local layers with registry layers
      var totalLayersToLoad = yield this.compare(hubResult, tag);

      log.info('  getting total size...');
      var diffFilesToDownload;
      if (forceOverwrite) {
        // will download and overwrite all files
        log.info('  (force overwrite is active)...');
        diffFilesToDownload = totalLayersToLoad;
      } else {
        // will download only files that does not exists
        log.info('  checking already downloaded files...');
        diffFilesToDownload = yield this.checkDownloadedFiles(totalLayersToLoad, outputPath);
      }

      // calculate total size to download
      var totalSize = yield this.getSizes(hubResult, diffFilesToDownload);
      if (totalSize > 0) {
        if (diffFilesToDownload.length > 0) {
          log.info('  downloading ' + diffFilesToDownload.length + ' layers ' + prettyBytes(totalSize) + '...');
          progressMessage = '        [:bar] :percent ( time elapsed: :elapsed seconds )';
          bar = new ProgressBar(progressMessage, {
            complete: '=',
            incomplete: ' ',
            width: 23,
            total: totalSize
          });
          iProgress = function(chunkSize) {
            bar.tick(chunkSize);
          };
          yield this.downloadList(hubResult, outputPath, diffFilesToDownload, iProgress);
        }
      }

      log.info('  download folder: `' + outputPath + '`');
      log.info('  loading ' + totalLayersToLoad.length + ' layers...');
      progressMessage = '        [:bar] :percent ( time elapsed: :elapsed seconds )';
      bar = new ProgressBar(progressMessage, {
        complete: '=',
        incomplete: ' ',
        width: 23,
        total: totalLayersToLoad.length
      });
      iProgress = function(num) {
        bar.tick(num);
      };
      yield this.loadList(hubResult, outputPath, totalLayersToLoad, iProgress);

      log.info('  setting tags...');
      yield this.setTags(hubResult);

      log.info('finished loading', imageFullName);

      // if (outputPath === this.getOsTempDir()) {
      //   log.info('removing temp folder', outputPath);
      //   yield this.removeTempDir(outputPath);
      // }

      return true;
    }.bind(this))();
  }

  createAndCleanTempDir(dir) {
    return fsHelper.createCleanFolder(dir);
  }

  createTempDir(dir) {
    return fsHelper.createFolder(dir);
  }

  getOsTempDir(folderName) {
    var tempFolderName = folderName || 'docker-registry-downloader-temp';
    return path.join(os.tmpdir(), tempFolderName);
  }

  removeTempDir(dir) {
    return fsHelper.removeDirRecursive(dir);
  }

  getTotalSize(hubResult, tag) {
    return new Q.Promise(function (resolve, reject) {
      try {
        Q.spawn(function* () {

          var imageFullName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
          log.info('comparing docker registry with local images...');
          // compare all local layers with registry layers
          var totalLayersToLoad = yield this.compare(hubResult, tag);

          // calculate total size to download
          log.info('getting total size', imageFullName);
          var totalSize = yield this.getSizes(hubResult, totalLayersToLoad);
          if (totalSize > 0 && totalLayersToLoad.length > 0) {
            log.info('  layers to download: ' + totalLayersToLoad.length);
            log.info('  total layers size : ' + prettyBytes(totalSize));
          }

          resolve({
            layersCount: totalLayersToLoad.length,
            totalSize  : totalSize
          });

        }.bind(this));
      } catch (err) {
        log.error(err.stack);
        reject(err);
      }
    }.bind(this));
  }

  getTotalLocalSize(hubResult, tag) {
    return Q.async(function* () {

      // get from local docker
      var fullTagName = hubResult.namespace + '/' + hubResult.repository + ':' + tag;
      if (hubResult.namespace === 'library') {
        fullTagName = hubResult.repository + ':' + tag;
      }
      var imagesFound = yield this.dockerRemote.searchImagesByTag(fullTagName);

      if (!imagesFound || imagesFound.length === 0) {
        return ({
          total_local_size : 0,
          localAncestors   : [],
          imagesFound      : imagesFound,
        });
      }
      var localAncestors = yield this.dockerRemote.anscestors(imagesFound[0].Id);

      var total_local_size = _.reduce(localAncestors, function(sum, anscestor) {
        return sum + anscestor.imageInspect.Size;
      }, 0);

      log.debug('\n\n:: syncronizer - getTotalLocalSize ' + fullTagName + ' ::');
      log.debug(prettyBytes(total_local_size));

      return ({
        total_local_size : total_local_size,
        localAncestors   : localAncestors,
        imagesFound      : imagesFound,
      });
    }.bind(this))();
  }

  getAllLayersFromRegistry(hubResult, tag) {
    return Q.async(function* () {
      // get endpoint and token from docker hub
      var imageId = yield this.dockerRegistry.getImageIdByTag(hubResult, tag);
      var registryAncestors = yield this.dockerRegistry.ancestry(hubResult, imageId);

      return ({
        hub_result      : hubResult,
        image_id        : imageId,
        registry_layers : registryAncestors
      });
    }.bind(this))();
  }

  checkLocalLayer(image_id) {
    return Q.async(function* () {
      var image = yield this.dockerRemote.getImage(image_id);
      var inspected_image = yield this.dockerRemote.inspectImage(image);
      return inspected_image;
    }.bind(this))();
  }

  getLayersDiff(hubResult, tag) {
    return Q.async(function* () {
      var registry_result = yield this.getAllLayersFromRegistry(hubResult, tag);
      var registry_layers_ids = registry_result.registry_layers;

      var non_existent_locally_ids = [];

      for (var i = 0; i < registry_layers_ids.length; i++) {
        var registry_layer = registry_layers_ids[i];
        var local_layer = yield this.checkLocalLayer(registry_layer);
        if (!local_layer) {
          non_existent_locally_ids.push(registry_layer);
        }
      }

      return ({
        registry_layers_ids      : registry_layers_ids,
        non_existent_locally_ids : non_existent_locally_ids,
      });
    }.bind(this))();
  }

  checkTotalLocalSizes(layers_id_list) {
    return Q.async(function* () {
      var sum_sizes = 0;

      for (var i = 0; i < layers_id_list.length; i++) {
        var layer_id = layers_id_list[i];
        var local_layer = yield this.checkLocalLayer(layer_id);
        if ( local_layer ) {
          sum_sizes += local_layer.Size;
        }
      }

      return sum_sizes;

    }.bind(this))();
  }

  checkTotalLocalCount(layers_id_list) {
    return Q.async(function* () {
      var sum_count = 0;

      for (var i = 0; i < layers_id_list.length; i++) {
        var layer_id = layers_id_list[i];
        var local_layer = yield this.checkLocalLayer(layer_id);
        if ( local_layer ) {
          sum_count = sum_count + 1;
        }
      }

      return sum_count;
    }.bind(this))();
  }

}

module.exports = {
  __esModule: true,
  get default() { return Syncronizer; }
};
