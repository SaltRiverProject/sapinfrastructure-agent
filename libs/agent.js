var program = require('commander')
var _ = require('lodash')

var log = require('./logger')
var Socket = require('./socket')

var config = require('../config.json')

var reconnectAttempts = 0

var Agent;
Agent = function(env) {
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
}
module.exports = Agent;
