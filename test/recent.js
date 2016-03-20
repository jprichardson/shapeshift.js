var test = require('tape').test
var shapeshift = require('../')

test('should get a list of recent transactions', function (t) {
  t.plan(8)
  shapeshift.recent(function (err, recent) {
    t.ifError(err, 'no error')
    t.true(Array.isArray(recent), 'recent is an array')
    t.same(recent.length, 50, 'recent array should be 50')
    t.true('curIn' in recent[0], 'has curIn field')
    t.true('curOut' in recent[0], 'has curOut field')
    t.true('timestamp' in recent[0], 'has timestamp field')
    t.true('amount' in recent[0], 'has amount field')
    t.true('amountOut' in recent[0], 'has amountOut field')
    t.end()
  })
})
