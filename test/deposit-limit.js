var test = require('tape').test
var shapeshift = require('../')

test('should get the deposit limit', function (t) {
  t.plan(2)

  var pair = 'btc_ltc'
  shapeshift.depositLimit(pair, function (err, limit) {
    t.ifError(err, 'no error')
    t.same(typeof limit, 'string')
    t.end()
  })
})
