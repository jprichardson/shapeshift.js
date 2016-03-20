/* global XMLHttpRequest */
// XHR code based on https://github.com/Raynos/xhr
(function (module, exports) {
  'use strict'

  var shapeshift = {
    // for cors endpoint
    cors: true,

    // for intercepting http
    XMLHttpRequest: typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest : null,

    // for custom Promise
    Promise: typeof Promise !== 'undefined' ? Promise : null
  }

  // export
  if (typeof module === 'object') module.exports = shapeshift
  else exports.shapeshift = shapeshift

  // util
  // poor man's clone
  function clone (o) {
    return JSON.parse(JSON.stringify(o))
  }

  // http functions
  function getURL () {
    // https://shapeshift.io/api.html#cors
    var base = 'https://' + (module.exports.cors ? 'cors.' : '') + 'shapeshift.io/'
    return base + [].slice.call(arguments).join('/')
  }

  shapeshift.request = function (url, data, callback) {
    var method = data === null ? 'GET' : 'POST'
    var aborted = false

    var _callback = callback
    var alreadyCalled = false
    callback = function () {
      if (alreadyCalled) return
      alreadyCalled = true
      _callback.apply(undefined, arguments)
    }

    var xhr = new shapeshift.XMLHttpRequest()
    var timeoutTimer = setTimeout(function () {
      aborted = true // IE9 may still call onreadystatechange
      xhr.abort('timeout')
      var e = new Error('XMLHttpRequest timeout')
      e.code = 'ETIMEDOUT'
      xhr.onerror(e)
    }, 30000)

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) xhr.onload()
    }

    xhr.onload = function () {
      if (aborted) return
      clearTimeout(timeoutTimer)
      var status = (xhr.status === 1223 ? 204 : xhr.status)

      if (status === 0) return callback(new Error('Internal XMLHttpRequest Error'))
      if (status !== 200) return callback(new Error('HTTP status code: ' + status))

      var body
      if (xhr.response) {
        body = xhr.response
      } else if (xhr.responseType === 'text' || !xhr.responseType) {
        body = xhr.responseText || xhr.responseXML
      }

      try {
        callback(null, JSON.parse(body))
      } catch (err) {
        callback(err)
      }
    }

    xhr.onerror = xhr.ontimeout = function (evt) {
      clearTimeout(timeoutTimer)
      if (!(evt instanceof Error)) evt = new Error('' + (evt || 'Unknown XMLHttpRequest Error'))
      evt.statusCode = 0
      callback(evt)
    }

    xhr.onprogress = function () {}

    xhr.open(method, url)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(data)
  }

  // add Promise support to function
  var promisify = function (fn) {
    return function () {
      var args = [].slice.call(arguments)
      var callback = args[args.length - 1]

      if (shapeshift.Promise === null) {
        if (typeof callback !== 'function') throw new Error('callback expected, because Promise doesn\'t supported')
        return void fn.apply(null, args)
      }

      return new shapeshift.Promise(function (resolve, reject) {
        var newCallback = function () {
          if (arguments[0]) reject(arguments[0])
          else resolve([].slice.call(arguments))

          if (typeof callback === 'function') callback.apply(null, arguments)
        }

        if (typeof callback === 'function') {
          args[args.length - 1] = newCallback
        } else {
          args.push(newCallback)
        }

        fn.apply(null, args)
      })
    }
  }

  // shapeshift functions
  shapeshift.coins = promisify(function (callback) {
    var url = getURL('getcoins')
    shapeshift.request(url, null, callback)
  })

  shapeshift.depositLimit = promisify(function (pair, callback) {
    var url = getURL('limit', pair.toLowerCase())
    shapeshift.request(url, null, function (err, data) {
      if (err) return callback(err)
      callback(null, data.limit)
    })
  })

  shapeshift.emailReceipt = promisify(function (emailAddress, txId, callback) {
    var url = getURL('mail')
    shapeshift.request(url, { email: emailAddress, txid: txId }, function (err, data) {
      if (err) return callback(err)
      if (data.error) return callback(new Error(data.error), data)
      callback(null, data.email)
    })
  })

  shapeshift.exchangeRate = promisify(function (pair, callback) {
    var url = getURL('rate', pair.toLowerCase())
    shapeshift.request(url, null, function (err, data) {
      if (err) return callback(err)
      callback(null, data.rate)
    })
  })

  shapeshift.marketInfo = promisify(function (pair, callback) {
    // no pair passed
    if (typeof pair === 'function') {
      callback = pair
      pair = ''
    }

    var url = getURL('marketinfo', pair)
    shapeshift.request(url, null, callback)
  })

  shapeshift.recent = promisify(function (callback) {
    var url = getURL('recenttx', '50')
    shapeshift.request(url, null, callback)
  })

  shapeshift.shift = promisify(function (withdrawalAddress, pair, options, callback) {
    if (options.amount) {
      shapeshift._shiftFixed(withdrawalAddress, pair, options.amount, options, callback)
    } else {
      shapeshift._shift(withdrawalAddress, pair, options, callback)
    }
  })

  shapeshift._shift = promisify(function (withdrawalAddress, pair, options, callback) {
    var url = getURL('shift')
    var payload = clone(options)
    payload.withdrawal = withdrawalAddress
    payload.pair = pair
    shapeshift.request(url, payload, function (err, data) {
      if (err) return callback(err, data)
      if (data.error) return callback(new Error(data.error), data)
      callback(null, data)
    })
  })

  shapeshift._shiftFixed = promisify(function (withdrawalAddress, pair, amount, options, callback) {
    var url = getURL('sendamount')
    var payload = clone(options)
    payload.withdrawal = withdrawalAddress
    payload.pair = pair
    payload.amount = amount
    shapeshift.request(url, payload, function (err, data) {
      if (err) return callback(err, data)
      if (data.error) return callback(new Error(data.error), data)
      // shapeshift is inconsistent here, notice in `shift()` there is no success field
      callback(null, data.success)
    })
  })

  shapeshift.status = promisify(function (depositAddress, callback) {
    var url = getURL('txStat', depositAddress)
    shapeshift.request(url, null, function (err, data) {
      if (err) return callback(err)
      if (data.error) return callback(new Error(data.error), data.status, data)
      callback(null, data.status, data)
    })
  })

  shapeshift.transactions = promisify(function (apiKey, address, callback) {
    if (typeof address === 'function') {
      callback = address
      address = null
    }

    var url = !address
      ? getURL('txbyapikey', apiKey)
      : getURL('txbyaddress', address, apiKey)

    shapeshift.request(url, null, function (err, data) {
      if (err) return callback(err, data)
      if (!Array.isArray(data)) return callback(new Error('Data is not of type array. Possible error?'), data)
      callback(null, data)
    })
  })
})(typeof module === 'undefined' || module, this)
