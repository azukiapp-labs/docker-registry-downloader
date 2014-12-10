var request = require('request');
var Q  = require('q');

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
          resolve(JSON.parse(body));
        }
        else {
          reject(response);
        }
      }
      request(options, callback);
    });
  }

}

module.exports = {
  __esModule: true,
  get default() { return DockerRegistry }
};