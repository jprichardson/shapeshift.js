var test = require('tape').test
var shapeshift = require('../')

test('should get status of deposit address with valid address', function (t) {
  t.plan(10)
  var address = '5' // hmm, unfortunately accepts shitty malformed addresses, this is somehow valid too
  shapeshift.status(address, function (err, status, data) {
    t.ifError(err, 'no error')
    t.same(status, 'complete')
    t.same(data.status, 'complete', 'status field should be complete')
    t.same(data.address, address, 'address field should be address passed')
    t.same(data.withdraw, '1H9rH6Na5sTTGbzqohVKYQdQPxEJqcmzy4')
    t.same(data.incomingCoin, 28.922632) // todo, make string
    t.same(data.incomingType, 'STR')
    t.same(data.outgoingCoin, '0.00030000')
    t.same(data.outgoingType, 'BTC')
    t.true('transaction' in data, 'data has transaction field')
    t.end()
  })
})

test.skip('should get status of deposit address with invalid address', function (t) {
  t.plan(4)
  var address = '5-should-not-be-real-address' // hmm, unfortunately accepts shitty malformed addresses, this is somehow valid too
  shapeshift.status(address, function (err, status, data) {
    t.ifError(err, 'no error')
    t.same(status, 'no_deposits', 'status shoudl be "no_deposits"')
    t.true('status' in data, 'data should have status field')
    t.true('address' in data, 'data should have address field')
    t.end()
  })
})
