require('source-map-support').install();

import "babel-polyfill";

import DockerHub      from './docker-hub';
import DockerRegistry from './docker-registry';
import DockerRemote   from './docker-remote';
import Syncronizer    from './syncronizer';

module.exports = {
  DockerHub      : DockerHub,
  DockerRegistry : DockerRegistry,
  DockerRemote   : DockerRemote,
  Syncronizer    : Syncronizer
};
