#!/usr/bin/env node

var libs        = require('../lib/src/index');
var DockerHub   = libs.DockerHub;
var Syncronizer = libs.Syncronizer;
var dockerHub   = new DockerHub();
var syncronizer = new Syncronizer();


var usage_message = ['',
  ' Usage:',
  '',
  '   $ registrySync [namespace/repository:tag] [options]',
  '',
  ' Options:',
  '',
  '   --output, -o          Sets the output folder',
  '   --forceOverwrite, -f  Download and overwrite if file exists',
  '',
  ' Examples:',
  '',
  '   $ registrySync azukiapp/ruby:2.2',
  '   $ registrySync azukiapp/ruby:2.1    -o /tmp',
  '   $ registrySync azukiapp/ruby:latest --output /tmp --forceOverwrite',
  ''].join('\n');

var argv = require('yargs')
  .usage(usage_message)

  .alias('_', 'from')
  .describe('_', 'Docker namespace/repository:tag to download and sync')

  .alias('o', 'output')
  .describe('o', 'Output folder to save temporary downloaded content')

  .alias('f', 'forceOverwrite')
  .describe('f', 'Download all files again, even if them exists')

  .showHelpOnFail(true)
  .argv;

if (argv && argv._.length === 0) {
  console.log(usage_message);
  process.exit(1);
}

var fromFullPath = argv._;
var outputFolder = argv.o;
var forceOverwrite = argv.f;

var fromFullPathRegex = /^([\w-]+)\/([\w-]+):(.*)$/gm;
var captureResult = fromFullPathRegex.exec(fromFullPath);
if (captureResult && captureResult.length === 4) {
  var namespace = captureResult[1];
  var repository = captureResult[2];
  var tag = captureResult[3];
}
else {
  console.log(usage_message);
  process.exit(1);
}

if (!outputFolder) {
  outputFolder = syncronizer.getOsTempDir();
  syncronizer.createTempDir(outputFolder);
}

// get token from DOCKER HUB API
dockerHub.images(namespace, repository)
.then(function(hubResult) {
  // sync registry layer with local layers
  return syncronizer.sync(hubResult, tag, outputFolder, forceOverwrite);
})
.catch(function(err) {
  console.log(err);
  console.log(err.stack);
  process.exit(1);
});
