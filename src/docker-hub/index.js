var request        = require('requestretry');
var DOCKER_HUB_URL = 'https://index.docker.io';
var Q              = require('q');
var request        = require('requestretry');
var log            = require('../helpers/logger');
var _              = require('lodash');

class DockerHub {

  constructor(request_options) {
    this.__request_options = request_options || {};
  }

  get request_options() {
    return this.__request_options;
  }

  set request_options(value) {
    this.__request_options = value;
  }

  auth (namespace, user, password) {
    return new Q.Promise(function (resolve, reject) {
      var url = DOCKER_HUB_URL + '/v1/repositories/' + namespace + '/auth';
      request.get(url).auth(user, password, false, function (error, response/*, body*/) {
        if (!error && response.statusCode == 200) {
          log.debug('\n\n:: docker-hub - auth ::');
          log.debug(response.headers);
          resolve(response.headers['set-cookie']);
        } else {
          reject(error);
        }
      });
    });
  }

  images (namespace, repository) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {
      var options = _.assign({
          url: DOCKER_HUB_URL + '/v1/repositories/' + namespace + '/' + repository + '/images',
          headers: {
            'X-Docker-Token': 'true'
          }
        },
        request_options_local
      );
      function callback(error, response/*, body*/) {
        if (!error && response.statusCode == 200) {

          // ---------------------------------------
          // response.headers
          // ---------------------------------------
          // X-Docker-Endpoints → registry-1.docker.io
          // X-Docker-Token → signature=0aeea6bc91a4d1d0ff7892c9c101df17ce9c8a60,repository="azukiapp/azktcl",access=read
          log.debug('\n\n:: docker-hub - images ::');
          var result = {
            namespace  : namespace,
            repository : repository,
            endpoint   : response.headers['x-docker-endpoints'],
            token      : response.headers['x-docker-token'],
          };
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

  search (query) {
    var request_options_local = this.__request_options;
    return new Q.Promise(function (resolve, reject) {
      var options = _.assign({
          url: DOCKER_HUB_URL + '/v1/search',
          qs: {
            q: query
          }
        },
        request_options_local
      );
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          // ---------------------------------------
          // search body result
          // ---------------------------------------
          // {
          //    "query":"azktcl",
          //    "num_results":1,
          //    "results":[
          //       {
          //          "is_automated":true,
          //          "name":"azukiapp/azktcl",
          //          "is_trusted":true,
          //          "is_official":false,
          //          "star_count":0,
          //          "description":""
          //       }
          //    ]
          // }
          var result = JSON.parse(body);
          log.debug('\n\n:: docker-hub - search ::');
          log.debug(result);
          resolve(result);
        } else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerHub; }
};
