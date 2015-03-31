import FsHelper from '../fs-helper';

var request     = require('requestretry');
var Q           = require('q');
var log         = require('../helpers/logger');
var fs          = require('fs');
var path        = require('path');
var prettyBytes = require('pretty-bytes');
var _           = require('lodash');

var fsHelper = new FsHelper();

class DockerRegistry {

  constructor(request_options) {
    this.__request_options = request_options || {};
  }

  get request_options() {
    return this.__request_options;
  }

  set request_options(value) {
    this.__request_options = value;
  }

  tags(hubResult) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/repositories/' +
                hubResult.namespace + '/' + hubResult.repository + '/'  + 'tags',
          headers: {
            'Authorization': 'Token ' + hubResult.token
          }
        },
        request_options_local
      );

      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          // ---------------------------------------
          // tags body result
          // ---------------------------------------
          // {
          //   "0.0.1": "ed4ba53b2e313083e985878df58bb7d24d0b21c9688084d56c2315f78d70eabe",
          //   "0.0.2": "afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120"
          // }
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-registry - tags ::');
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

  getImageIdByTag(hubResult, tag) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/repositories/' + hubResult.namespace +
               '/' + hubResult.repository + '/tags/' + tag,
          headers: {
            'Authorization': 'Token ' + hubResult.token
          }
        },
        request_options_local
      );

      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-registry - getImageIdByTag ::');
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

  ancestry(hubResult, imageId) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/images/' + imageId + '/ancestry',
          headers: {
            'Authorization': 'Token ' + hubResult.token
          }
        },
        request_options_local
      );

      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          // [
          //   "afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120",
          //   "0f3c5c8028fbab8bd93aec406dcd4dce23296894abcf2ca93bde408348926f65",
          //   "fcef2eea64366f6dce50892aa457180e5a329eae6b89500881edd944e1b5b1d0",
          //   "9dfede15b99153dfa84ef64a4be3ce59e04e20f3cbdd7b6c58e2263907c50163",
          //   "aeae21d102569e871da86fd51ab8fd34ca12031a779ba6d02eea55a7f5123c10",
          //   "15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303",
          //   "c58121c7a8c81b5848ec10e04029456c71ddd795ccca9c6a281d42ae34c3b73b",
          //   "511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158"
          // ]
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-registry - ancestry ::');
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }

      try {
        request(options, callback);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  imageJson(hubResult, imageId) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/images/' + imageId + '/json',
          headers: {
            'Authorization': 'Token ' + hubResult.token
          }
        },
        request_options_local
      );

      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          // {
          //    "id":"afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120",
          //    "parent":"0f3c5c8028fbab8bd93aec406dcd4dce23296894abcf2ca93bde408348926f65",
          //    "created":"2014-07-15T00:46:39.736719637Z",
          //    "container":"77561a3d9fd7d19f8bdc25b633868d5ea9e54b31d5bfb48b8713650afb3bce25",
          //    "container_config":{
          //       "Hostname":"c0c4734da754",
          //       ...
          //    },
          //    "docker_version":"1.1.0",
          //    "author":"Everton Ribeiro \u003cnuxlli@gmail.com\u003e",
          //    "config":{
          //       "Hostname":"c0c4734da754",
          //       ...
          //    },
          //    "architecture":"amd64",
          //    "os":"linux",
          //    "Size":0
          // }
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-registry - imageJson ::');
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

  allAnscestorByTag(hubResult, tag) {
    return Q.async(function* () {
      log.debug('\n\n:: docker-registry - allAnscestorByTag ::');
      log.debug('endpoint:', hubResult.endpoint);
      log.debug('token:', hubResult.token);
      log.debug('namespace:', hubResult.namespace);
      log.debug('repository:', hubResult.repository);
      log.debug('tag:', tag);
      log.debug('>>------------');

      // get imageId from tag
      var imageId = yield this.getImageIdByTag(hubResult, tag);
      //get all anscestors
      var anscestors = yield this.ancestry(hubResult, imageId);

      return anscestors;
    }.bind(this))();
  }

  downloadImageGetSize(hubResult, imageId) {
    var request_options_local = this.__request_options;
    return function (callback) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/images/' + imageId + '/layer',
          headers: {
            'Authorization': 'Token ' + hubResult.token
          },
          method: 'GET'
        },
        request_options_local
      );

      var r = request(options).on('response', function(res) {
        log.debug('\n\n:: docker-registry - downloadImageGetSize headers ::');
        log.debug('ID:  ', imageId);
        var len = parseInt(res.headers['content-length'], 10);
        log.debug('res.headers:', res.headers);
        log.debug('size:', prettyBytes(len));
        r.abort();
        callback(null, len);
      });
    };
  }

  downloadImage(hubResult, outputPath, imageId, iProgress) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve/*, reject*/) {

      var options = _.assign({
          url: 'https://' + hubResult.endpoint + '/v1/images/' + imageId + '/layer',
          headers: {
            'Authorization': 'Token ' + hubResult.token
          },
          method: 'GET'
        },
        request_options_local
      );

      // HTTP GET Request -> outputFile
      request(options)
        .on('response', function(res) {
          log.debug('\n\n:: docker-registry - downloadImage headers ::');
          log.debug(res.headers);

          res.on('data', function (chunk) {
            if (iProgress) {
              iProgress(chunk.length);
            }
          });

          res.on('end', function () {
            resolve(outputPath);
          });
        })
        .pipe(fs.createWriteStream(outputPath));

    });
  }

  // http://docs.docker.com/reference/api/docker_remote_api_v1.16/#load-a-tarball-with-a-set-of-images-and-tags-into-docker
  prepareLoading(hubResult, outputPath, imageId, iProgress) {
    return Q.async(function* () {
      // An image tarball contains one directory per image layer (named using its long ID)
      var outputLoadPath = path.join(outputPath, imageId);
      yield fsHelper.createCleanFolder(outputLoadPath);

      // VERSION: currently 1.0 - the file format version
      var versionFilePath = path.join(outputLoadPath, "VERSION");
      yield Q.nfcall(fs.writeFile, versionFilePath, "1.0");

      // json: detailed layer information, similar to docker inspect layer_id
      var jsonResult = yield this.imageJson(hubResult, imageId);
      var jsonFilePath = path.join(outputLoadPath, "json");
      yield Q.nfcall(fs.writeFile, jsonFilePath, JSON.stringify(jsonResult, ' ', 3));

      // layer.tar: A tarfile containing the filesystem changes in this layer
      var layerTarFilePath = path.join(outputLoadPath, "layer.tar");
      yield this.downloadImage(hubResult, layerTarFilePath, imageId, iProgress);

      // create tar file
      yield fsHelper.tarPack(outputLoadPath, path.join(outputLoadPath, '..', imageId + '.tar'));

      // remove folder
      yield fsHelper.removeDirRecursive(outputLoadPath);

      return outputLoadPath;
    }.bind(this))();
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerRegistry; }
};
