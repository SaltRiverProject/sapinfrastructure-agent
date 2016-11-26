var _      = require('lodash')
var Socket = require('./socket')

var reconnectAttempts = 0

var Agent;
Agent = function(config) {
  if (!config) {
    throw new Error('Config not passed! does the config file exist?')
  }

  //connects to the backend and fires off the first report
  Socket.connect(config)
  Socket.socket.on('reconnect', function () {
    log.info('socket reconnected!')
    Socket.reconnect()
    reconnectAttempts = 0
  })

  Socket.socket.on('connect', function(){
    Socket.connected(config)
    .catch(function (error) {
      if (error) {
        log.error(error)
        process.exit()
      }
    })
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
}
module.exports = Agent;
