var fs = require('fs')
var path = require('path')
var _  = require('lodash')
var log = require('./logger')
var chalk = require('chalk')
var inquirer = require('inquirer')
var os = require('os')

var configFile = path.join(__dirname, '..', 'config.json')
var sampleConfigFile = path.join(__dirname, '..', 'config.sample.json')

function writeConfigFile (config, options) {
  fs.readFile(configFile, function (err, data) {
    if (options.force) {
      fs.truncate(configFile, 0, function() {
        fs.writeFile(configFile, JSON.stringify(config, null, 2), function (err) {
          if (err) {
            log.error('Error writing to', configFile, err)
          }
          log.debug('setup.writeConfigFile -', 'Config succesfully written to', configFile)
        })
      })
    } else {
      log.error('setup.writeConfigFile', 'Error writing to', configFile, 'file exists! Pass -f flag to overwrite.')
    }
  })
}

var Setup;
Setup = function(env) {
  var sampleConfig = require(sampleConfigFile)
  var config = _.merge({}, sampleConfig)

  var fsOptions = {
    force: false
  }

  if (env.force) {
    log.info('setup -', 'Overwrite mode enabled, overwriting', configFile)
    fsOptions = _.merge({}, fsOptions, { force: true })
  }

  var questions = [
    {
      type: 'input',
      name: 'agentUrl',
      message: 'What is the agent url',
      default: config.agentUrl
    },
    {
      type: 'input',
      name: 'hostname',
      message: 'What is the hostname of this server',
      default: os.hostname()
    },
    {
      type: 'checkbox',
      name: 'fileSystemReports',
      message: 'What files do you want to report',
      choices: config.fileSystemReports,
      default: config.fileSystemReports
    },
    {
      name: 'cpuReporting',
      type: 'checkbox',
      message: 'Report CPU Info?',
      choices: function () {
        return config.cpu.map(function (item, index) {
          return item.name
        })
      },
      default: function () {
        var _config = []
        _.each(config.cpu, function (item, index) {
          if (item.active) {
            _config.push(item.name)
          }
        })
        return _config
      }
    },
    {
      name: 'memoryReporting',
      type: 'checkbox',
      message: 'Report Memory?',
      choices: function () {
        return config.memory.map(function (item, index) {
          return item.name
        })
      },
      default: function () {
        var _config = []
        _.each(config.memory, function (item, index) {
          if (item.active) {
            _config.push(item.name)
          }
        })
        return _config
      }
    },
    {
      name: 'swapReporting',
      type: 'checkbox',
      message: 'Report Swap?',
      choices: function () {
        return config.swap.map(function (item, index) {
          return item.name
        })
      },
      default: function () {
        var _config = []
        _.each(config.swap, function (item, index) {
          if (item.active) {
            _config.push(item.name)
          }
        })
        return _config
      }
    },
    {
      name: 'services',
      type: 'checkbox',
      message: 'What services do you want to be able to control (start/stop)',
      choices: function () {
        var services = []
        _.each(config.services, function (s) {
          services.push(s.service)
        })
        return services
      },
      default: function () {
        var services = []
        _.each(config.services, function (s) {
          if (s.active) {
            services.push(s.service)
          }
        })
        return services
      }
    }
  ]
  inquirer.prompt(questions)
  .then(function (answers) {
    config = _.merge({}, config, answers)
    delete config.memory
    delete config.swap
    delete config.cpu

    writeConfigFile(config, fsOptions)
  })
}
module.exports = Setup
