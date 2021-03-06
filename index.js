#! /usr/bin/env node
var program  = require('commander')
var _        = require('lodash')
var pkg      = require('./package.json')

try {
  if (process.argv[2] !== 'setup') {
    var config = require('./config.json')
  }
  log          = require('./libs/logger')(config)
  var setup    = require('./libs/setup')
  var register = require('./libs/register')
  var agent    = require('./libs/agent')
  var Socket   = require('./libs/socket')
} catch (e) {
  if (e) {
    console.error('Config file does not exist, did you run `esoagent setup` first?')
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
    setup(env)
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

program
  .command('config')
  .description('displays the agent configuration')
  .action(function configList() {
    console.log(JSON.stringify(config, null, 2))
  })
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
