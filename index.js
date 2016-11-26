#! /usr/bin/env node
var program  = require('commander')
var _        = require('lodash')
var pkg      = require('./package.json')
try {
  var config   = require('./config.json')
  // global log
  log          = require('./libs/logger')(config)
  var setup    = require('./libs/setup')
  var register = require('./libs/register')
  var agent    = require('./libs/agent')
  var systemd  = require('./libs/systemd')
  var Socket   = require('./libs/socket')
} catch (e) {
  if (e) {
    console.error('Config file does not exist', e)
    process.exit()
  }
}

program
  .version(pkg.version)
  .command('setup')
  .description('sets up the agent for the first time')
  .option('-f --force', 'force overwrite of existing config file')
  .option('-c --config_file', 'specify a config file')
  .action(function agentSetup (env) {
    setup(env, config)
  });

program
  .command('register')
  .description('registers an agent with sapinfrastructure')
  .option('-w --wait_for_activation <seconds>', 'Waits xx seconds before trying to connect')
  .action(function agentRegister (env) {
    register(env, config)
  });

program
  .command('run')
  .description('runs the agent')
  .action(function agentRun () {
    agent(config)
  });

// program
//   .command('systemd')
//   .description('installs the systemd scripts to run the agent as a service. (Must be ran with sudo/root)')
//   .option('-f --force', 'force overwrite of existing systemd file')
//   .action(systemd);

program.parse(process.argv);

process.on('SIGINT', function() {
  console.log()
  log.info('Shutting down agent...')
  Socket.disconnect()
  .then(function (){
    log.info('Agent shutdown complete.')
    process.exit();
  });
});
