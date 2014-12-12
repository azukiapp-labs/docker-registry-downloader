require('source-map-support').install();
require('traceur');

import DockerHub from './docker-hub';
import DockerRegistry from './docker-registry';

module.exports = {
	DockerHub: DockerHub,
	DockerRegistry: DockerRegistry
};