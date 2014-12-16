var request = require('request');
var Q  = require('q');
var log = require('../helpers/logger');
var fs = require('fs');
var rmdir = require('rimraf');
var path = require('path');
var ProgressBar = require('progress');
var prettyBytes = require('pretty-bytes');

class DockerRegistry {

  tags(endpoint, token, namespace, repository) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: 'https://' + endpoint + '/v1/repositories/'+ namespace +'/' + repository + '/'  + 'tags',
        headers: {
          'Authorization': 'Token ' + token
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
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
        }
        else {
          reject(response);
        }
      }
      request(options, callback);
    });
  }

  getImageIdByTag(endpoint, token, namespace, repository, tag) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: 'https://' + endpoint + '/v1/repositories/'+ namespace +'/' + repository + '/tags/' + tag,
        headers: {
          'Authorization': 'Token ' + token
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-registry - getImageIdByTag ::');
          log.debug(result);
          resolve(result);
        }
        else {
          reject(response);
        }
      }
      request(options, callback);
    });
  }

  ancestry(endpoint, token, imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: 'https://' + endpoint + '/v1/images/'+ imageId +'/ancestry',
        headers: {
          'Authorization': 'Token ' + token
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
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
        }
        else {
          reject(response);
        }
      }

      try{
        request(options, callback);
      }
      catch(err){
        reject(err);
      }
    });
  }

  imageJson(endpoint, token, imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: 'https://' + endpoint + '/v1/images/'+ imageId +'/json',
        headers: {
          'Authorization': 'Token ' + token
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
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
        }
        else {
          reject(response);
        }
      }
      request(options, callback);
    });
  }

  allAnscestorByTag(endpoint, token, namespace, repository, tag) {
    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {
          log.debug('\n\n:: docker-registry - allAnscestorByTag ::');
          log.debug('endpoint:', endpoint);
          log.debug('token:', token);
          log.debug('namespace:', namespace);
          log.debug('repository:', repository);
          log.debug('tag:', tag);
          log.debug('>>------------');

          // get imageId from tag
          var imageId = yield this.getImageIdByTag(endpoint, token, namespace, repository, tag);
          //get all anscestors
          var anscestors = yield this.ancestry(endpoint, token, imageId);

          resolve(anscestors);

        }.bind(this));
      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

  downloadImageGetSize(endpoint, token, imageId) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: 'https://' + endpoint + '/v1/images/'+ imageId +'/layer',
        headers: {
          'Authorization': 'Token ' + token
        },
        method: 'GET'
      };

      var r = request(options)
        .on('response', function(res){
          log.debug('\n\n:: docker-registry - downloadImageGetSize headers ::');
          log.debug('ID:  ', imageId);
          var len = parseInt(res.headers['content-length'], 10);
          log.debug('size:', prettyBytes(len));
          r.abort();
          resolve(len);
        });
    });
  }

  downloadImage(endpoint, token, outputPath, imageId) {
    return new Q.Promise(function (resolve, reject, notify){

      var options = {
        url: 'https://' + endpoint + '/v1/images/'+ imageId +'/layer',
        headers: {
          'Authorization': 'Token ' + token
        },
        method: 'GET'
      };

      var imageIdPartial = imageId.substr(0, 8);

      // HTTP GET Request -> outputFile
      request(options)
        .on('response', function(res){
          log.debug('\n\n:: docker-registry - downloadImage headers ::');
          log.debug(res.headers);
          var len = parseInt(res.headers['content-length'], 10);
          var progressMessage = '  ' + imageIdPartial + ' [:bar] :percent :elapsed ( '+ prettyBytes(len) +' )';
          var bar = new ProgressBar(progressMessage, {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: len
          });

          res.on('data', function (chunk) {
            bar.tick(chunk.length);
          });

          res.on('end', function () {
            resolve(imageId + ' ' + prettyBytes(len));
          });
        })
        .pipe(fs.createWriteStream(outputPath));

    });
  }

  removeDirRecursive(dir) {
    return new Q.Promise(function (resolve, reject, notify){
      rmdir(dir, function(err) {
        if (err) {
          reject(err);
        }
        else{
          resolve(true);
        }
      });
    });
  }

  // http://docs.docker.com/reference/api/docker_remote_api_v1.16/#load-a-tarball-with-a-set-of-images-and-tags-into-docker
  prepareLoading(opts) {
    log.debug('\n\n:: docker-registry - prepareLoading - opts::');
    log.debug(opts);

    return new Q.Promise(function (resolve, reject, notify){
      try {
        Q.spawn(function* () {
          // An image tarball contains one directory per image layer (named using its long ID)
          var outputLoadPath = path.join(opts.outputPath, opts.imageId);
          if (fs.existsSync(outputLoadPath)) {
            // remove folder if exists
            yield this.removeDirRecursive(outputLoadPath);
          }
          yield Q.nfcall(fs.mkdir, outputLoadPath);

          // VERSION: currently 1.0 - the file format version
          var versionFilePath = path.join(outputLoadPath, "VERSION");
          yield Q.nfcall(fs.writeFile, versionFilePath, "1.0");

          // json: detailed layer information, similar to docker inspect layer_id
          var jsonResult = yield this.imageJson(opts.endpoint, opts.token, opts.imageId);
          var jsonFilePath = path.join(outputLoadPath, "json");
          yield Q.nfcall(fs.writeFile, jsonFilePath, JSON.stringify(jsonResult, ' ', 3));

          // layer.tar: A tarfile containing the filesystem changes in this layer
          var layerTarFilePath = path.join(outputLoadPath, "layer.tar");
          yield this.downloadImage(opts.endpoint, opts.token, layerTarFilePath, opts.imageId);

          resolve(outputLoadPath);

        }.bind(this));
      } catch(err){
        reject(err);
      }
    }.bind(this));
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerRegistry }
};
