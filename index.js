#! /usr/bin/env node

var program = require('commander')
var _ = require('lodash')

var pkg = require('./package.json')
var log = require('./libs/logger')
var setup = require('./libs/setup')
var register = require('./libs/register')
var agent  = require('./libs/agent')

var Socket = require('./libs/socket')

program
  .version(pkg.version)
  .command('setup')
  .description('sets up the agent for the first time')
  .option('-f --force', 'force overwrite of existing config file')
  .option('-c --config_file', 'specify a config file')
  .action(setup);

program
  .command('register')
  .description('registers an agent with sapinfrastructure')
  .option('-w --wait_for_activation <seconds>', 'Waits xx seconds before trying to connect')
  .action(register);

program
  .command('agent')
  .description('runs the agent')
  .action(agent);

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
