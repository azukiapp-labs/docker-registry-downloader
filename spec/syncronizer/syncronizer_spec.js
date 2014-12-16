require('source-map-support').install();
// var _ = require('lodash');
var chai  = require('chai');
var Q  = require('q');
var log = require('../../src/helpers/logger');
var logError = require('../../src/helpers/error-helper');
Q.onerror = logError;

import Syncronizer from '../../src/syncronizer';
import DockerHub from '../../src/docker-hub';
var syncronizer = new Syncronizer();

describe('Syncronizer', function() {

  it('should compare local and registry layers', function(done) {

    Q.spawn(function* () {
      var namespace = 'library';
      var repository = 'ruby';
      var tag = '2.1';

      var result = yield syncronizer.compare(namespace, repository, tag);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should sum all sizes', function(done) {
    this.timeout(30000); // 30 seconds

    Q.spawn(function* () {

      var diffRuby21Layers = [
        '0839cc41437e0b6af99b75118e41f9bb2512a5f5957163e3bea98d3148645ec0',
        'd600f2a44ad04757afc5d9f70ccd5b427c392e175aa97c42da8f34f4076f69b4',
        '3ed0d8d0b22aeaffca08a5b93a8e3802a3c85008137e9ead406bbc4e58510e08',
        'bb471af2f662b43f47a96a10ead6d8bc052f2ad92172651b8bdec486968ce52f',
        'ce3fecb444ac7eaff2b53b87b1c63b879ecd3d8c9c7ca49f2387de4eb28254ee',
        '2f0a763ebc4981326436e82efb2619c61f59ea09a494f4fef2eae4fc3daba69d',
        'b025428b4bd38af69b9214403edbb8ccafbb5131065ec8f42c97cb1d51589282',
        '24b657b21fd69744a6d51f966186bc8da67e8a2214afbd8d58d7bc4fbf6d047e',
        '98a4bbd1aad52951137372ee50c6c95e886b995d5b8f487be0a178510f092448',
        '2b6c3a03a1b706fc523902b27c0ea111e603b7621d9dc4b341956ad71f8f61e8',
        'ea9819f761f174724f5f05712235b2bcf535bd5e05b476286fd5e46864f58768',
        '8f3e5f544a175edaf28ee2f44477dc40cfd15922e1edfcf024761687f705c251',
        'f99c114b8ec17cf509ec78ab7f490fe4cd984098d825cf74e7a0adea849a19dd'
      ];

      var namespace = 'library';
      var repository = 'ruby';

      var dockerHub = new DockerHub();
      var hubResult = yield dockerHub.images(namespace, repository);

      var result = yield syncronizer.getSizes(namespace, repository, hubResult, diffRuby21Layers);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should download, prepare and load one image layer', function(done) {
    this.timeout(15000); // 15 seconds
    Q.spawn(function* () {

      var dockerHub = new DockerHub();
      var namespace = 'azukiapp';
      var repository = 'azktcl';
      var hubResult = yield dockerHub.images(namespace, repository);

      var opts = {
        endpoint  : hubResult.endpoint,
        token     : hubResult.token,
        outputPath: __dirname + '/../../../spec/docker-registry/output',
        imageId   : '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303',
      };

      var result = yield syncronizer.downloadAndLoad(opts);

      chai.expect(result).to.not.be.undefined();
      done();
    });

  });




});
