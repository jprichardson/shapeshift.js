var test = require('tape').test
var shapeshift = require('../')

test('should get an array of supported coins', function (t) {
  t.plan(6)

  shapeshift.coins(function (err, coinData) {
    t.ifError(err, 'no error')

    t.true('BTC' in coinData, 'BTC in coinData')
    t.same(coinData.BTC.name, 'Bitcoin', 'BTC has a field `name`')
    t.same(coinData.BTC.symbol, 'BTC', 'BTC has a field `symbol`')
    t.true('status' in coinData.BTC, 'BTC has a field `status`')
    t.true('image' in coinData.BTC, 'BTC has a field `image`')

    t.end()
  })
})
