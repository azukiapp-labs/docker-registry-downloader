import { createPromise, promiseResolve, promiseReject } from './promises';

var Requester = {
  request: function (context, options) {
    return createPromise(context, function (resolve, reject) {
      require('requestretry')(options, function (errorResult, responseResult, bodyResult) {
        var error;
        if (responseResult && responseResult.statusCode === 200) {
          // ---------------------------------------
          // response.headers
          // ---------------------------------------
          // X-Docker-Endpoints → registry-1.docker.io
          // X-Docker-Token → signature=0aeea6bc91a4d1d0ff7892c9c101df17ce9c8a60,repository="azukiapp/azktcl",access=read
          var result = {
            // docker repository info
            namespace  : options.namespace,
            repository : options.repository,
            tag        : options.tag,
            // docker headers
            endpoint   : responseResult.headers['x-docker-endpoints'],
            token      : responseResult.headers['x-docker-token'],
            // request result
            error      : errorResult,
            response   : responseResult,
            body       : bodyResult,
          };
          return resolve(result);
        } else {
          if (!errorResult) {
            var message = ['request error\n'];
            message.push('[');
            message.push(responseResult.statusCode);
            message.push(']; ');
            message.push('url: ');
            message.push(options.url);
            message.push('body: ');
            message.push(bodyResult);
            error = new Error(message.join(''));
            error.code = responseResult.statusCode;
            return reject(error);
          } else {
            return reject(errorResult);
          }
        }
        return reject(error);
      });
    });
  },

  requestJSON: function (context, options) {
    return Requester.request(context, options).then(function (requestResult) {
      if (requestResult && requestResult.body) {
        try {
          var result = JSON.parse(requestResult.body);
          return promiseResolve(result);
        } catch (e) {
          e.reason = '\n - JSON.parse ERROR';
          promiseReject(e);
        }
      } else {
        promiseReject(new Error(requestResult));
      }
    });
  },

};

module.exports = Requester;
