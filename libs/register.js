var fs = require('fs')
var path = require('path')
var _  = require('lodash')

var log = require('./logger')
var inquirer = require('inquirer')
var axios = require('axios')

var sysinfo = require('./sysinfo')
var configFile = path.join(__dirname, '..', 'config.json')

try {
  var config = require(path.join(__dirname, '..', 'config.json'))
} catch (e) {

}

function writeAgentKey (agentKey) {
  if (!agentKey) {
    log.error('Something funky went wrong, the agentKey wasn\'t passed to writeAgentKey')
    return;
  } else {
    var _config = _.merge({}, config, { agentKey: agentKey })
    fs.writeFile(configFile, JSON.stringify(_config, null, 2), function (err) {
      if (err) {
        log.error('Error writing to', configFile, err)
      }
      log.info('Config succesfully written to', configFile)
    })
  }
}

var Register;
Register = function(env) {
  sysinfo
  .collect()
  .then(function (info) {
    axios
    .post(config.baseUrl + config.agentUrl + '/register', {
      hostname: info.osinfo.hostname,
      ipv4: info.ipv4,
      ipv6: info.ipv6
    })
    .then(function (response) {
      if (response.status !== 200){
        return reject('Whoops, looks like something went wrong with the agent registration, check the server logs.')
      }
      return response
    })
    .then(function (response) {
      writeAgentKey(response.data.data.agentKey)
      if (env.wait_for_activation) {
        var waitTime = parseInt(env.wait_for_activation) * 1000
        log.info('Agent registered with sapinfrastructure, waiting', waitTime/1000, 'seconds before trying to connect')

        setTimeout(function() {
          log.info('Agent registered with sapinfrastructure, trying to connect.')
        }, waitTime)
      } else {
        log.info('Agent registered with sapinfrastructure, you will need to approve the agent in the control panel.')
      }
    })
    .catch(function (error) {
      if (error) {
        switch (error.response.data.code) {
          case 'E_AGENT_ALREADY_REGISTERED':
            log.error(error.response.data.message)
            break;
          default:
            log.error(error.response.data.message)
            break;
        }
      }
    })
  })
  // inquirer.prompt(questions)
  // .then(function (answers) {
  //   // writeConfigFile(config, fsOptions)
  // })
}
module.exports = Register
