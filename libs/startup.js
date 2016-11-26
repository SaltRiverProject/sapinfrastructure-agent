var log = require('./libs/logger')()
var setup = require('./libs/setup')
var register = require('./libs/register')
var Socket = require('./libs/socket')

// try {
//   var config = require('../config.json')
// } catch (e) {
//   if (e) {
//     log.error('Config file does not exist')
//   }
// }

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
