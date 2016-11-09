var program = require('commander')
var _ = require('lodash')

var pkg = require('./package.json')
var log = require('./libs/logger')
var setup = require('./libs/setup')
var register = require('./libs/register')
var Socket = require('./libs/socket')

var config = require('./config.json')

var reconnectAttempts = 0
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
  // .command('register', 'registers the agent to the sapinfrastructure backend')
  // .action(register);
program.parse(process.argv);

//connects to the backend and fires off the first report
Socket.connect()

Socket.socket.on('reconnect', function () {
  log.info('socket reconnected!')
  Socket.reconnect()
  reconnectAttempts = 0
})

Socket.socket.on('connect', function(){
  log.info('Agent connected...')
  Socket.connected()
  reconnectAttempts = 0
});

Socket.socket.on('connecting', function () {
  log.info('socket connecting...')
});



Socket.socket.on('reconnecting', function () {
  log.warn('socket reconnecting. Attempt #' + reconnectAttempts)
  reconnectAttempts++
})

Socket.socket.on('reconnect_failed', function () {
  log.error('socket failed to reconnect...')
  Socket.disconnect()
});

Socket.socket.on('disconnect', function(){
  log.error('socket disconnected from backend!')
  Socket.disconnect()
});

process.on('SIGINT', function() {
  console.log()
  log.info('Shutting down agent...')
  Socket.disconnect()
  .then(function (){
    log.info('Agent shutdown complete.')
    process.exit();
  });
});
