var test = require('tape').test
var shapeshift = require('../')

test.skip('> when intercepting http get, should call external http get', function (t) {
  t.plan(3)

  var _get = shapeshift.http.get
  shapeshift.http.get = function (url, callback) {
    t.pass()
    _get(url, callback)
  }

  shapeshift.coins(function (err, coinData) {
    // restore
    shapeshift.http.get = _get

    t.ifError(err, 'no error on coins()')
    t.true('BTC' in coinData, 'BTC returned in coinData')

    t.end()
  })
})
