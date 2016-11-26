var fs             = require('fs')
var path           = require('path')
var _              = require('lodash')
var sysinfo        = require('./sysinfo')
var moment         = require('moment')
var socketIOClient = require('socket.io-client')
var sailsIOClient  = require('sails.io.js')
var io             = sailsIOClient(socketIOClient)

io.sails.autoConnect = false
io.sails.environment = 'production'

function runReport (self, config) {
  if (!config) {
    throw new Error('Config not passed! does the config file exist?')
  }
  // var nextRunDate = currentDate + config.collectIntervalInMs
  log.info(moment().format('MM/DD/YYYY HH:mm:ss'), '- Running agent report')

  sysinfo
  .collect()
  .then(function (info) {
    log.debug('sysinfo.collect -', 'Agent has finished collecting information')
    if(!info) {
      log.debug('sysinfo.collect -', 'System info hasn\'t changed, not submitting a new report')
    } else {
      log.debug('sysinfo.collect -', 'Passing off to websocket')
      return self
      .report(info, config)
      .then(function (result) {
        log.debug('Reported submitted.')
        log.info('Report Submitted at', moment().format('MM/DD/YYYY HH:mm:ss'))
        log.info('Next report will run', moment().add(config.collectIntervalInMs, 'ms').calendar())
      })
    }
  })
  .catch(function (error) {
    if (error) {
      log.error(error)
    }
  });
}

var Socket;
Socket = {
  socket: null,
  agent: {},
  _timers: [],

  /**
   * send a report to the backend.
   * @return {Promise} resolves if the report was successful
   */
  report: function (info, config) {
    var self = this
    var socket = self.socket
    return new Promise(function (resolve, reject) {
      if (!info) {
        return reject('socket.report -', 'System Info not provided! Aborting report.')
      }

      socket.post(config.agentUrl + '/report', _.merge({}, info), function (res) {
        if (res.status !== 200) {
          return reject(res.message)
        }

        log.debug('socket.report.post -', 'Agent report sent succesfully')
        resolve()
      })
    })
  },

  /**
   * Send a POST to /v1/agent/connect
   * logs the socketId, and the agentKey to the backend
   */
  connected: function (config) {
    if (!config) {
      throw new Error('Config not passed! does the config file exist?')
    }

    var self = this
    var socket = self.socket

    io.sails.url = config.baseUrl
    io.sails.headers = {
      'authorization': 'Bearer ' + config.agentKey
    }
    return new Promise(function (resolve, reject) {
      socket.post(config.agentUrl + '/connect', { hostname: config.hostname }, function (res, jwr) {
        if (res.status !== 200) {
          return reject(res.message)
        }

        _agent = res.data
        self.agent = _.merge({}, { id: _agent.id, rooms: ['agent-' + _agent.id, 'agents']})
        log.debug('socket.connected -', 'subscribed to agent rooms [\'' + self.agent.rooms.join('\', \'') + '\']')
        resolve()
      })
    })
  },

  /**
   * reconnects to the backend via websockets
   * just calls socket.connect()
   */
  reconnect: function () {
    var self = this
    log.info('Restarting agent...')
    self.connect()
  },

  /**
   * handles the connect/disconnect/reconnect
   * of the socket system to the backend.
   */
  connect: function (config) {
    if (!config) {
      throw new Error('Config not passed! does the config file exist?')
    }

    var self = this
    io.sails.url = config.baseUrl
    io.sails.headers = {
      'authorization': 'Bearer ' + config.agentKey
    }
    self.socket = io.sails.connect({
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000
    })

    var timerId = setTimeout(function (){
      runReport(self, config)
    }, config.collectIntervalInMs)
    self._timers.push(timerId)
    runReport(self, config)
  },


  /**
   * disconnect handler
   * runs clearTimeout against all self._timers,
   * to avoide timers still running when were in a
   * disconnected state.
   * @return {Promise}
   */
  disconnect: function () {
    var self = this
    self.socket = null
    self.agent = {}

    return new Promise(function (resolve, reject) {
      if(self._timers) {
        log.debug('socket.disconnect.clearTimeouts')
        _.each(self._timers, function (timerId) {
          clearTimeout(timerId)
        });
        self._timers = []
      }
      resolve();
    })
  }
}
module.exports = Socket
