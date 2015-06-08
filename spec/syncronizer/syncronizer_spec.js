import h from '../spec_helper';
import Syncronizer from '../../src/syncronizer';
import DockerHub   from '../../src/docker-hub';
import { async }   from '../../src/helpers/promises';

var syncronizer = new Syncronizer();

describe('Syncronizer', function() {

  describe('compare repos', function() {

    it('should get null when check an invalid local layer', function(done) {
      return async(function* () {
        var result = yield syncronizer.checkLocalLayer('invalid_layer_id');
        h.expect(result).to.be.null;
        done();
      });
    });

    it('should get diff from registry and local layers', function(done) {
      return async(function* () {

        var namespace = 'saitodisse';
        var repository = '10mblayers';
        var tag = 'latest';

        var dockerHub = new DockerHub();
        var hubResult = yield dockerHub.images(namespace, repository);

        var result = yield syncronizer.getLayersDiff(hubResult, tag);

        h.expect(result).to.not.be.undefined;
        done();
      });
    });

    it('should count local layers', function(done) {
      return async(function* () {

        var local_layers_to_check = [ 'e8f08a5f551055074246712d662a570dd0c77267431179e6be4d67cd982c0e45',
          'beadc5a63bb040b3db1aaaca341dc671e4a6c2d4e8225922547810ba7cc09c5b',
          '1c214b1b0e353a5bbed75f3e1f03be1a21303a9101b389b21a7a8bfd76b15ee7',
          '5398df0552f4166b34f15b80be815f1c02a273aea76247a2c191bfb392607251',
          'a40834ae7d4a274424415e0184ab4fe89316124cb935e59e2060aa353b64f747',
          'd5e54a7e17cfc43779546691c7fceb58fc28b76294614dfe00dbc6a6ee34c27c',
          'f699ea6fa8cd39b53da7f661248671ba02b07e8e95c4bead9b01da6d7e248a4b',
          '7f7125e08aadb6adb4a41b67b2a33d4571143cd05d24b734a571272a8e303f66',
          'e1debeaf628b547cd05a5e7ee6f49669926fd34d63d4ed6465259300cd5130d0',
          '437e87c05d0e4b63d98a2a291d6b4fc0ee40a85b676851b8254791b77597a826' ];

        var result = yield syncronizer.checkTotalLocalCount(local_layers_to_check);

        h.expect(result).to.not.be.undefined;
        done();
      });
    });
  });
});
