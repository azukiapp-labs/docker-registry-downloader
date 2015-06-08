import { createPromise, promiseResolve, promiseReject } from './promises';

var Requester = {
  request: function (context, options) {
    return createPromise(context, function (resolve, reject) {
      require('requestretry')(options, function (errorResult, responseResult, bodyResult) {
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
          var message = [];
          var error;

          if (responseResult && responseResult.statusCode) {
            message.push(responseResult.statusCode);
          }
          if (errorResult) {
            message.push(errorResult.message);
          }
          message.push(': ');

          if (options.namespace) {
            message.push(options.namespace);
          }
          if (options.repository) {
            message.push('/');
            message.push(options.repository);
          }
          if (options.tag) {
            message.push(':');
            message.push(options.tag);
          }

          message.push(' >> url: ');
          message.push(options.url);

          error = new Error(message.join(''));

          if (errorResult) {
            error.code = errorResult.code;
          }

          return reject(error);
        }
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
