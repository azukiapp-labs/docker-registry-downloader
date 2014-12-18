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
    this.timeout(10000);

    Q.spawn(function* () {

      var namespace = 'library';
      var repository = 'ruby';

      var dockerHub = new DockerHub();
      var hubResult = yield dockerHub.images(namespace, repository);

      var result = yield syncronizer.getSizes(namespace, repository, hubResult, diffRuby21Layers);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should download several layers', function(done) {
    this.timeout(18000);
    Q.spawn(function* () {

      var dockerHub  = new DockerHub();
      var namespace  = 'azukiapp';
      var repository = 'azktcl';
      var hubResult  = yield dockerHub.images(namespace, repository);
      var imageIdList = [
        'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120',
        '0f3c5c8028fbab8bd93aec406dcd4dce23296894abcf2ca93bde408348926f65',
        'fcef2eea64366f6dce50892aa457180e5a329eae6b89500881edd944e1b5b1d0',
        '9dfede15b99153dfa84ef64a4be3ce59e04e20f3cbdd7b6c58e2263907c50163',
        'aeae21d102569e871da86fd51ab8fd34ca12031a779ba6d02eea55a7f5123c10',
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303',
        'c58121c7a8c81b5848ec10e04029456c71ddd795ccca9c6a281d42ae34c3b73b',
        '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158'
      ];

      var result = yield syncronizer.downloadList(
        hubResult.endpoint,
        hubResult.token,
        __dirname + '/../../../spec/docker-registry/output',
        imageIdList
      );

      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should load several layers', function(done) {
    this.timeout(18000);
    Q.spawn(function* () {

      var dockerHub  = new DockerHub();
      var namespace  = 'azukiapp';
      var repository = 'azktcl';
      var hubResult  = yield dockerHub.images(namespace, repository);
      var imageIdList = [
        'afecd72a72fc2f815aca4e7fd41bfd01f2e5922cd5fb43a04416e7e291a2b120',
        '0f3c5c8028fbab8bd93aec406dcd4dce23296894abcf2ca93bde408348926f65',
        'fcef2eea64366f6dce50892aa457180e5a329eae6b89500881edd944e1b5b1d0',
        '9dfede15b99153dfa84ef64a4be3ce59e04e20f3cbdd7b6c58e2263907c50163',
        'aeae21d102569e871da86fd51ab8fd34ca12031a779ba6d02eea55a7f5123c10',
        '15e0cd32c467ccef1c162ee17601e34aa28de214116bba3d4698594d810a6303',
        'c58121c7a8c81b5848ec10e04029456c71ddd795ccca9c6a281d42ae34c3b73b',
        '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158'
      ];

      var result = yield syncronizer.loadList(
        hubResult.endpoint,
        hubResult.token,
        __dirname + '/../../../spec/docker-registry/output',
        imageIdList
      );

      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should tag local layers', function(done) {
    this.timeout(3000);
    Q.spawn(function* () {

      var dockerHub  = new DockerHub();
      var namespace  = 'azukiapp';
      var repository = 'azktcl';
      var hubResult  = yield dockerHub.images(namespace, repository);
      var result = yield syncronizer.setTags(hubResult.endpoint, hubResult.token, namespace, repository);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

  it('should sync: download, load and tag by repository and tag', function(done) {
    this.timeout(18000);
    Q.spawn(function* () {

      var namespace  = 'azukiapp';
      var repository = 'azktcl';
      var tag = '0.0.2';
      var result = yield syncronizer.sync(namespace, repository, tag);
      chai.expect(result).to.not.be.undefined();
      done();
    });
  });

});
