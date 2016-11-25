var winston = require('winston')
var _ = require('lodash')
var path = require('path')

var config = require(path.join(__dirname, '..', 'config.json'))

var _config = _.merge({}, {
  log: {
    error: {
      level: 'error'
    },
    console: {
      level: 'verbose',
      colorize: true
    },
    agent: {
      level: 'debug'
    }
  },
}, config)

var _winston =  new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: _config.log.console.level,
      colorize: _config.log.console.colorize
    }),
    new (winston.transports.File)({
      name: 'error-log',
      filename: path.join(__dirname, '..', 'logs/agent.error.log'),
      level: _config.log.error.level
    }),
    new (winston.transports.File)({
      name: 'agent-log',
      filename: path.join(__dirname, '..', 'logs/agent.log'),
      level: _config.log.agent.level
    })
  ]
})

module.exports = _winston
