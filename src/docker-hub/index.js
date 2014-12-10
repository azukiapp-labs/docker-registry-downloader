var request = require('request');
var DOCKER_HUB_URL = 'https://index.docker.io';
var Q  = require('q');
var request = require('request');

class DockerHub {

  auth(namespace, user, password) {
    return new Q.Promise(function (resolve, reject, notify){
      var url = DOCKER_HUB_URL + '/v1/repositories/'+ namespace +'/auth';
      request.get(url).auth(user, password, false, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(response.headers['set-cookie']);
        }
        else {
          reject(error);
        }
      });
    });
  }

  images(namespace, repository) {
    return new Q.Promise(function (resolve, reject, notify){
      var options = {
        url: DOCKER_HUB_URL + '/v1/repositories/'+ namespace +'/'+ repository +'/images',
        headers: {
          'X-Docker-Token': 'true'
        }
      };
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = {
            endpoint: response.headers['x-docker-endpoints'],
            token:    response.headers['x-docker-token'],
          };
          resolve(result);
        }
        else {
          reject(error);
        }
      }
      request(options, callback);
    });
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerHub }
};