var Q  = require('q');
var fs = require('fs');
var rmdir = require('rimraf');

class FsHelper {

  removeDirRecursive(dir) {
    return new Q.Promise(function (resolve, reject, notify) {
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

  createCleanFolder(fullPath, cleanFolder) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        Q.spawn(function* () {
          var willCleanFolder = cleanFolder || true;
          if (willCleanFolder) {
            if( yield this.fsExists(fullPath) ) {
              // remove folder if exists
              yield this.removeDirRecursive(fullPath);
            }
          }
          yield Q.nfcall(fs.mkdir, fullPath);
          resolve(fullPath);
        }.bind(this));
      } catch(err) {
        reject(err);
      }
    }.bind(this));

  }

  fsExists(fullPath) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        fs.exists(fullPath, function(result) {
          resolve(result);
        });
      } catch(err) {
        reject(err);
      }
    }.bind(this));

  }

  tarPack(folderToPack, outputTarfile) {
    return new Q.Promise(function (resolve, reject, notify) {
      try {
        var write = fs.createWriteStream;
        var pack = require('tar-pack').pack;
        pack(folderToPack)
          .pipe(write(outputTarfile))
          .on('error', function (err) {
            reject(err);
          })
          .on('close', function () {
            resolve(true);
          });
      } catch(err) {
        reject(err);
      }
    }.bind(this));

  }
}

module.exports = {
  __esModule: true,
  get default() { return FsHelper }
};
