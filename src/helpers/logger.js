var winston = require('winston');
var log     = new winston.Logger();

log.add(winston.transports.Console, {
  handleExceptions: true,
  colorize: true,
  prettyPrint: true,
  level: process.env.DOCKER_REGISTRY_DEBUG_LEVEL
});

module.exports = log;
