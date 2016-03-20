var test = require('tape').test
var shapeshift = require('../')

test('should get the current rate', function (t) {
  var pair = 'btc_ltc'
  shapeshift.exchangeRate(pair, function (err, rate) {
    t.ifError(err, 'no error')

    // we keep string to maintain precision
    t.same(typeof rate, 'string', 'rate should be string')
    // if this fails, LTC has gotten valuable
    t.true(parseFloat(rate) > 10, 'rate should be reasonable, or LTC is really valuable')

    t.end()
  })
})
