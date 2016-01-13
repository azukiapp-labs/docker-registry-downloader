var BB = require('bluebird');

try {
  BB.longStackTraces();
} catch (err) {}

var PromisesHelper = {
  __esModule: true,

  async(obj, func, ...args) {
    if (typeof obj == "function") {
      [func, obj] = [obj, null];
    }

    if (typeof obj == "object") {
      func = func.bind(obj);
    }

    BB.coroutine.addYieldHandler(function(yieldedValue) {
      if (typeof yieldedValue !== 'function') {
        return BB.resolve(yieldedValue);
      }
    });

    return BB.coroutine(func).apply(func, [...args]);
  },

  isPromise(obj) {
    if (typeof obj === 'object') {
      return obj.hasOwnProperty('_promise0'); // bluebird promise
    }
    return false;
  },

  nfcall(method, ...args) {
    return BB.promisify(method)(...args);
  },

  promiseResolve(...args) {
    return BB.resolve(...args);
  },

  promiseReject(...args) {
    return BB.reject(...args);
  },

  createPromise(context, func) {
    if (context) {
      return new BB.Promise(func.bind(context));
    } else {
      return new BB.Promise(func);
    }
  },

  promisifyAll(...args) {
    return BB.promisifyAll(...args);
  },

};

module.exports = PromisesHelper;
