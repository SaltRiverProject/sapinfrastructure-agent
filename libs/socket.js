var fs = require('fs')
var path = require('path')
var _  = require('lodash')
var sysinfo = require('./sysinfo')
var moment = require('moment')

var log = require('./logger')
var socketIOClient = require('socket.io-client')
var sailsIOClient = require('sails.io.js')
var io = sailsIOClient(socketIOClient)

var config = require(path.join(__dirname, '..', 'config.json'))
io.sails.autoConnect = false
io.sails.url = 'http://localhost:1337'
io.sails.environment = 'production'
io.sails.headers = {
  'authorization': 'Bearer ' + config.agentKey
}

function runReport (self) {
  var currentDate = new Date().getTime()
  var nextRunDate = new Date().getTime() + config.collectInterval*1000

  log.info(new moment(currentDate).format('MM/DD/YYYY HH:mm:ss'), '- Running agent report')

  sysinfo
  .collect()
  .then(function (info) {
    log.debug('sysinfo.collect -', 'Agent has finished collecting information')
    if(!info) {
      log.debug('sysinfo.collect -', 'System info hasn\'t changed, not submitting a new report')
    } else {
      log.debug('sysinfo.collect -', 'Passing off to websocket')
      return self
      .report(info)
      .then(function (result) {
        log.debug('Reported submitted.')
        log.info('Report Submitted at', new moment(new Date().getTime()).format('MM/DD/YYYY HH:mm:ss'))
        log.info('Next report will run in approx', config.collectInterval/60, 'minute(s) at -', new moment(nextRunDate + config.collectInterval*1000).format('MM/DD/YYYY HH:mm:ss'))
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
  report: function (info) {
    var self = this
    var socket = self.socket
    return new Promise(function (resolve, reject) {
      if (!info) {
        return reject('socket.report -', 'System Info not provided! Aborting report.')
      }

      socket.post('/v1/agent/report', _.merge({}, info), function (res) {
        if (res.status === 200) {
          log.debug('socket.report.post -', 'Agent report sent succesfully')
          resolve(res.data)
        } else {
          return reject()
        }
      })
    })
  },

  /**
   * Send a POST to /v1/agent/connect
   * logs the socketId, and the agentKey to the backend
   */
  connected: function () {
    var self = this
    var socket = self.socket
    socket.post('/v1/agent/connect', { hostname: config.hostname }, function (res, jwr) {
      _agent = res.data
      self.agent = _.merge({}, { id: _agent.id, rooms: ['agent-' + _agent.id, 'agents']})
      log.debug('socket.connected -', 'subscribed to agent rooms [\'' + self.agent.rooms.join('\', \'') + '\']')
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
  connect: function () {
    var self = this
    self.socket = io.sails.connect({
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000
    })

    setTimeout(function () {
      console.log()
      log.debug('report will run in', config.collectInterval*0.5/60, 'minutes(s)')
    }, config.collectInterval*1000*0.5)

    var timerId = setTimeout(function (){
      runReport(self)
    }, config.collectInterval*1000)
    self._timers.push(timerId)
    runReport(self)
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
