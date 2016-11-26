var fs = require('fs')
var path = require('path')
var _  = require('lodash')
var log = require('./logger')()

var objectDiff = require('objectdiff')
var si = require('systeminformation')

var SysInfo = {
  _cache: {},
  osinfo: function () {
    return si
    .osInfo()
    .then(function (osInfo) {
      return osInfo
    })
  },
  networkInterfaces: function () {
    return si
    .networkInterfaceDefault()
    .then(function (defaultInterface) {
      return si
      .networkInterfaces()
      .then(function (interfaces) {
        return interfaces.filter(function (interface, index) {
          return interface.iface === defaultInterface
        })
      })
      .then(function (interfaces) {
        return { iface: interfaces[0].iface, ipv4: interfaces[0].ip4, ipv6: interfaces[0].ip6 }
      })
    })
  },
  cpu: function () {
    return si
    .cpu()
    .then(function (cpu) {
      return cpu
    })
  },
  memory: function () {
    return si
    .mem()
    .then(function (memory) {
      return _.omit(memory, ['active', 'available', 'buffcache', 'swaptotal', 'swapused', 'swapfree'])
    })
  },
  swap: function () {
    return si
    .mem()
    .then(function (memory) {
      var swap =  _.pick(memory, ['swaptotal', 'swapfree', 'swapused'])
      return {
        total: swap.swaptotal,
        free: swap.swapfree,
        used: swap.swapused
      }
    })
  },
  collect: function () {
    var self = this
    return new Promise(function (resolve, reject) {
      return Promise.all([
        self.osinfo(),
        self.networkInterfaces(),
        self.cpu(),
        self.memory(),
        self.swap()
      ])
      .then(function (args) {
        var data = {
          osinfo: args[0],
          ipv4: args[1].ipv4,
          ipv6: args[1].ipv6,
          cpu: args[2],
          memory: args[3],
          swap: args[4]
        }

        // if (_.isEmpty(self._cache)) {
        //   log.debug('socket.collect -', 'self._cache is empty. populating with data')
        //   self._cache = data
        //   return resolve(self._cache)
        // } else {
        //   if (diff.changed !== 'equal') {
        //     log.debug('socket.collect -', 'diff isn\'t equal, mapping over diff and populating changes')
        //     console.log(diff)
        //     _.each(diff.value, function (o, key) {
        //       if (o.changed !== 'equal') {
        //         console.log()
        //         console.log()
        //         console.log('o.value', o.value)
        //         var _newData
        //         _newData[key] = {}
        //         _.each(o.value, function (v, subKey) {
        //           if(v.changed !== 'equal') {
        //             console.log()
        //             console.log()
        //             console.log('v.added', v.added)
        //             _newData[subKey] = v.added
        //             console.log('v.added', _newData)
        //           }
        //         })
        //       }
        //     })
        if (_.isEqual(self._cache, data)) {
          return resolve()
        } else {
          self._cache = data
          return resolve(self._cache)
        }

          // } else {
            // self._cache = newData
            // return resolve()
          // }

        // }
      })
      .catch(function (error) {
        if (error) {
          return reject(error)
        }
      })
    })
  }
}
module.exports = SysInfo
