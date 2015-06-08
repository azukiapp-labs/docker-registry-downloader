import h from '../spec_helper';
import DockerRemote from '../../src/docker-remote';
import { async }   from '../../src/helpers/promises';

describe('Docker Remote API', function() {

  var dockerRemote = new DockerRemote();

  it('should get all containers', function(done) {
    return async(function* () {
      var result = yield dockerRemote.listAllContainers();
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should get only active containers', function(done) {
    return async(function* () {
      var result = yield dockerRemote.listActiveContainers();
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should list all images', function(done) {
    return async(function* () {
      var result = yield dockerRemote.listImages();
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should inpect one image', function(done) {
    return async(function* () {
      var image = yield dockerRemote.getImage('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      var result = yield dockerRemote.inspectImage(image);
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should searchImages from tag', function(done) {
    return async(function* () {
      var result = yield dockerRemote.searchImagesByTag('azukiapp/azktcl:0.0.2');
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should get parent image ID', function(done) {
    return async(function* () {
      var result = yield dockerRemote.getParent('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

  it('should get all parents images ID', function(done) {
    return async(function* () {
      var result = yield dockerRemote.anscestors('afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120');
      h.expect(result).to.not.be.undefined;
      done();
    });
  });

});
