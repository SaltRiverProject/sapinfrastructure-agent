
var fs       = require('fs')
var path     = require('path')
var _        = require('lodash')
var log      = require('./logger')
var chalk    = require('chalk')
var inquirer = require('inquirer')
var getos    = require('getos')
var exec     = require('child_process').exec

try {
  var config = require(path.join(__dirname, '..', 'config.json'))
} catch (e) {
}


function systemdTemplate (_config) {
  var systemd = '[Unit]\n'
  systemd += 'Description=ESO Agent Collector\n'
  systemd += '[Service]\n'
  systemd += 'ExecStart="/usr/bin/env ' + _config.nodeBin + ' ' + _config.agentPath + '/index.js agent"\n'
  systemd += 'Restart=always\n'
  systemd += 'SyslogIdentifier=esoagent\n'
  systemd += 'Environment="NODE_ENV=production" \n'

  systemd += '[Install]\n'
  systemd += 'WantedBy=multi-user.target\n'
  return systemd
}

function writeSystemdFile (_config) {
  var systemdFile = _config.systemdLocation + '/' + _config.systemdServiceName
  var systemdFileExists = fs.existsSync(systemdFile)
  return new Promise(function (resolve, reject) {
    if (systemdFileExists && !_config.force) {
      var msg = 'setup.writeSystemdFile Error writing to ' + systemdFile + ' file exists! Pass -f flag to overwrite.'
      return reject(msg)
    } else {
      fs.writeFile(systemdFile, systemdTemplate(_config), function (err) {
        if (err) {
          log.error('Error writing to', systemdFile, err)
          return reject(err)
        }
        return resolve()
      })
    }
  })
}

var Systemd;
Systemd = function (env) {
  // test for root level access
  if (!process.env.SUDO_UID || !process.env.USERNAME === 'root' || !process.env.USER === 'root') {
    log.error('You need to run this as root in order to install the systemd scripts!')
    return
  }

  var questions = [
    {
      type: 'input',
      name: 'systemdLocation',
      message: 'Where are we installing the systemd script?:',
      default: function () {
        return getos(function(e, os) {
          if (e) throw e
          var dist = os.dist

          switch (dist) {
            case 'Ubuntu Linux':
              if (os.release >= 14.10) {
                return '/etc/systemd/system'
              }
              default:
                return '/etc/systemd/system'
              break;
          }

        })
      }
    },
    {
      type: 'input',
      name: 'systemdServiceName',
      message: 'What is the systemd service name?:',
      default: 'esoagent.service'
    },
    {
      type: 'input',
      name: 'agentPath',
      message: 'What is the path to the esoagent?:',
      default: '/opt/apps/esoagent'
    }
  ]


  var fsOptions = {
    force: false
  }

  if (env.force) {
    log.info('setup -', 'Overwrite mode enabled, overwriting')
    fsOptions = _.merge({}, fsOptions, { force: true })
  }

  inquirer.prompt(questions)
  .then(function (answers) {
    config = _.merge({}, config, answers, fsOptions)

    if(!answers.nodeBin) {
      config.nodeBin = 'node'
    }

    writeSystemdFile(config)
    .then(function() {
      log.info('Succesfully created systemd file.')
      log.info('You\'ll need to run the following to reload/enable the service:')
      console.log('       sudo systemctl daemon-reload && sudo systemctl enable esoagent.service && sudo systemctl start esoagent.service')
    })
    .catch(function (err) {
      log.error('error', err)
    })
  })
}
module.exports = Systemd
