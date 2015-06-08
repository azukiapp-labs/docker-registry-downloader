var createPromise   = require('../helpers/promises').createPromise;
var promiseResolve  = require('../helpers/promises').promiseResolve;
var request         = require('../helpers/requester').request;
var DOCKER_HUB_URL  = 'https://index.docker.io';
var log             = require('../helpers/logger');
var _               = require('lodash');

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
    return createPromise(this, function (resolve, reject) {
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

    var options = _.assign({
      // request options
      url: DOCKER_HUB_URL + '/v1/repositories/' + namespace + '/' + repository + '/images',
      headers: {
        'X-Docker-Token': 'true'
      },
      // docker options
      namespace: namespace,
      repository: repository
    }, request_options_local);

    return request(this, options);
  }

  search (query) {
    var options = _.assign({
      url: DOCKER_HUB_URL + '/v1/search',
      qs: {
        q: query
      }
    }, this.__request_options);
    return request(this, options).then(function (requestResult) {
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
      var result = JSON.parse(requestResult.body);
      log.debug('\n\n:: docker-hub - search ::');
      log.debug(result);
      return promiseResolve(result);
    });
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerHub; }
};
