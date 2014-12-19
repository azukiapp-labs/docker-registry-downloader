#!/usr/bin/env node

var argv = require('yargs')
  .usage('download and sync docker images.\nUsage: $0 [namespace/repository:tag] -o [output folder]')

  .alias('_', 'from')
  .describe('_', 'Docker namespace/repository:tag to download and sync')

  .alias('o', 'output')
  .describe('o', 'Output folder to save temporary downloaded content')

  .demand(1)
  .demand('output')


  .showHelpOnFail(true)
  .argv;

var fromFullPath = argv._;
var outputFolder = argv.o;

var libs = require('../lib/src/index');
var DockerHub   = libs.DockerHub;
var Syncronizer = libs.Syncronizer;
var dockerHub   = new DockerHub();
var syncronizer = new Syncronizer();

var fromFullPathRegex = /^(\w+)\/(\w+):(.*)$/gm;
var captureResult = fromFullPathRegex.exec(fromFullPath);
var namespace = captureResult[1];
var repository = captureResult[2];
var tag = captureResult[3];

// get token from DOCKER HUB API
dockerHub.images(namespace, repository).then(function(hubResult) {
  // sync registry layer with local layers
  return syncronizer.sync(hubResult, tag, outputFolder);
});
