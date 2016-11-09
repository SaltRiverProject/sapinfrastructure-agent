var winston = require('winston')
var _ = require('lodash')
var path = require('path')
var config = require(path.join(__dirname, '..', 'config.json'))

var _winston =  new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.log.console.level,
      colorize: config.log.console.colorize
    }),
    new (winston.transports.File)({
      name: 'error-log',
      filename: path.join(__dirname, '..', 'logs/agent.error.log'),
      level: config.log.error.level
    }),
    new (winston.transports.File)({
      name: 'agent-log',
      filename: path.join(__dirname, '..', 'logs/agent.log'),
      level: config.log.agent.level
    })
  ]
})

module.exports = _winston
