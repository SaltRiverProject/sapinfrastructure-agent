var log = require('./libs/logger')
var setup = require('./libs/setup')
var register = require('./libs/register')
var Socket = require('./libs/socket')

var config = require('./config.json')

module.exports = {
  di: function () {
    return new Promise(function (resolve, reject) {
      resolve()
      return reject()
    })
  },
  ascs: function () {
    return new Promise(function (resolve, reject) {
      resolve()
      return reject()
    })
  },
  ms: function () {
    return new Promise(function (resolve, reject) {
      resolve()
      return reject()
    })
  },
  db: function () {
    return new Promise(function (resolve, reject) {
      resolve()
      return reject()
    })
  },
  vtx: function () {
    return new Promise(function (resolve, reject) {
      resolve()
      return reject()
    })
  },
}
