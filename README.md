# shapeshift.io

[![NPM Package](https://img.shields.io/npm/v/shapeshift.io.svg?style=flat-square)](https://www.npmjs.org/package/shapeshift.io)
[![Build Status](https://img.shields.io/travis/ExodusMovement/shapeshift.io.svg?branch=master&style=flat-square)](https://travis-ci.org/ExodusMovement/shapeshift.io)
[![Dependency status](https://img.shields.io/david/ExodusMovement/shapeshift.io.svg?style=flat-square)](https://david-dm.org/ExodusMovement/shapeshift.io#info=dependencies)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A JavaScript component for the crypto currency buying and selling [ShapesShift.io](https://shapeshift.io/) service.

You can use [ShapeShift.io](https://shapeshift.io/) to instantly exchange Bitcoin for Litecoin and other
crypto currencies with no signup/account needed. Use [Exodus](http://www.exodus.io/) to manage your
crypto currency portfolios and easily exchange currencies with ShapeShift.

Works in both Node.js and the browser. API documentation here: https://shapeshift.io/api.

## Usage

### Installation

```shell
npm i --save shapeshift.io
```

### Browser

You can use this module in the browser. Just grab the file `https://github.com/ExodusMovement/shapeshift.io/tree/master/browser.js` and drop it in a script tag on your page like this:

```html
<script src="./shapeshift.js"></script>
```

The `shapeshift` object is global.

### ShapeShift API

First, a note about the REST API provided by ShapeShift. Be aware that there are some inconsistencies that will no doubt be fixed in later versions. The following lists these consistencies:

In returned data, `curIn`, `curOut`, `incomingType`, `outgoingType`, `inputCurrency`, `outputCurrency` all mean the same thing (obviously not input/output), namely a currency abbreviation. Just take note that `cur`, `type`, and `currency` usually mean the same thing.

### Methods

- [coins()](#coins)
- [depositLimit()](#depositlimit)
- [emailReceipt()](#emailreceipt)
- [exchangeRate()](#exchangerate)
- [marketInfo()](#marketinfo)
- [recent()](#recent)
- [shift()](#shift)
- [status()](#status)
- [transactions()](#transactions)

#### coins()

Get a map of supported coins.

Reference: https://shapeshift.io/api.html#getcoins

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.coins(function (err, coinData) {
  console.dir(coinData) // =>
  /*
    { BTC:
     { name: 'Bitcoin',
       symbol: 'BTC',
       image: 'https://shapeshift.io/images/coins/bitcoin.png',
       status: 'available' },

       ...

    VRC:
     { name: 'Vericoin',
       symbol: 'VRC',
       image: 'https://shapeshift.io/images/coins/vericoin.png',
       status: 'available' } }
  */
})
```

#### depositLimit()

Get the deposit limit before you purchase.

Reference: https://shapeshift.io/api.html#deposit-limit

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.depositLimit('btc_ltc', function (err, limit) {
  console.dir(limit) // => '4.41101872'
})
```

### emailReceipt()

Email receipt for a transaction. Use the transaction id of the withdrawal not the transaction id of the transaction.

Reference: https://shapeshift.io/api.html#email-receipt

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.deposit('YOUR_DEPOSIT_ADDRESS', function (err, status, data) {
  // status must be 'complete'
  if (status !== 'complete') return

  var txId = data.transaction
  shapeshift.emailReceipt('YOUR_EMAIL_ADDRESS', txId, function (err, data) {
    if (data.status === 'success') console.log('email sent!')
  })
})
```

#### exchangeRate()

Get the exchange rate. Note, the `rate` is returned as a type of `string`; this is to ensure precision matches the API exactly.

Reference: https://shapeshift.io/api.html#rate

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.exchangeRate('btc_ltc', function (err, rate) {
  console.dir(rate) // => '158.71815287'
})
```

### marketInfo()

Get the market information.

Reference: https://shapeshift.io/api#api-103

**Example:**

```js
var shapeshift = require('shapeshift.io')
var pair = 'btc_ltc' // pair is optional
shapeshift.marketInfo(pair, function (err, marketInfo) {
  console.dir(marketInfo) // =>
  /*
    {
      "rate": "121.25912408",
      "limit": 2.24854014,
      "pair": "btc_ltc",
      "minimum": 0.0000492,
      "minerFee": 0.003
    }
  */
})
```

**Note:** When `pair` is not passed, the field in the info changes from `minimum` to `min`.

#### recent()

Get a list of recent transactions / purchases.

Reference: https://shapeshift.io/api.html#recent-list

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.recent(function (err, recent) {
  console.dir(recent) // =>
  /*
  [ { curIn: 'DOGE',
      curOut: 'BTC',
      timestamp: 1428989390,
      amount: 417 },
    { curIn: 'DOGE',
      curOut: 'BTC',
      timestamp: 1428989390,
      amount: 417 },
    ...
  */
})
```

### shift()

Shift the coins. i.e. notify the API of the pair that you want to shift and the address that you want to receive the new coins at. Can also shift a fixed amount.

References: https://shapeshift.io/api.html#shift-conduit, https://shapeshift.io/api.html#sendamount

**Example (normal shift):**

```js
// example: converting BTC to LTC in any amount
var shapeshift = require('shapeshift.io')

// if something fails
var options = {
  returnAddress: 'YOUR_BTC_RETURN_ADDRESS'
}

shapeshift.shift('YOUR_LTC_ADDRESS', 'btc_ltc', options, function (err, returnData) {
  // ShapeShift owned BTC address that you send your BTC to
  var depositAddress = returnData.deposit

  // you need to actually then send your BTC to ShapeShift
  // you could use module `spend`: https://www.npmjs.com/package/spend
  // spend(SS_BTC_WIF, depositAddress, shiftAmount, function (err, txId) { /.. ../ })

  // later, you can then check the deposit status
  shapeshift.status(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```

**Example (fixed amount):**

```js
// example: converting BTC to a Fixed Amount of LTC
var shapeshift = require('shapeshift.io')

// if something fails
var options = {
  returnAddress: 'YOUR_BTC_RETURN_ADDRESS',
  amount: '0.1' // LTC amount that you want to receive to your LTC address
}

shapeshift.shift('YOUR_LTC_ADDRESS', 'btc_ltc', options, function (err, returnData) {
  // ShapeShift owned BTC address that you send your BTC to
  var depositAddress = returnData.deposit

  // NOTE: `depositAmount`, `expiration`, and `quotedRate` are only returned if
  // you set `options.amount`

  // amount to send to ShapeShift (type string)
  var shiftAmount = returnData.depositAmount

  // Time before rate expires (type number, time from epoch in seconds)
  var expiration = new Date(returnData.expiration * 1000)

  // rate of exchange, 1 BTC for ??? LTC (type string)
  var rate = returnData.quotedRate

  // you need to actually then send your BTC to ShapeShift
  // you could use module `spend`: https://www.npmjs.com/package/spend
  // CONVERT AMOUNT TO SATOSHIS IF YOU USED `spend`
  // spend(SS_BTC_WIF, depositAddress, shiftAmountSatoshis, function (err, txId) { /.. ../ })

  // later, you can then check the deposit status
  shapeshift.status(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```

Entire integration tests found here:
https://github.com/ExodusMovement/shapeshift.js/blob/master/test/integration/basic-shift.js and https://github.com/ExodusMovement/shapeshift.js/blob/master/test/integration/basic-shift-fixed.js

### status()

Get the status of most recent deposit transaction to the address.

Reference: https://shapeshift.io/api.html#status-deposit

**Example:**

```js
var shapeshift = require('shapeshift.io')
// you get this from the result of shift()
shapeshift.status('DEPOSIT_ADDRESS', function (err, status, data) {
  console.dir(data) // =>
  /*
    {
      status : "complete",
      address: <address>,
      withdraw: <withdrawal address>,
      incomingCoin: <amount deposited>,
      incomingType: <coin type of deposit>,
      outgoingCoin: <amount sent to withdrawal address>,
      outgoingType: <coin type of withdrawal>,
      transaction: <transaction id of coin sent to withdrawal address>
    }
  */
})
```

### transactions()

List all of the transactions associated with an API key. Optionally pass the withdrawal address so that you can see all of the transactions associated with an address.

API keys are generated by ShapeShift. You must request them here: https://shapeshift.io/affiliate.html

References: https://shapeshift.io/api.html#txbyapikey, https://shapeshift.io/api.html#txbyaddress

**Example:**

```js
shapeshift.transactions('YOUR_PRIVATE_KEY', function (err, transactions) {
  if (err) return console.error(err)
  transactions.forEach(function (tx) {
    console.dir(tx)
  })
})
```

### Intercept HTTP

You can intercept/modify http methods. This may be useful if you want to use an alternative http library.

**Example:**

```js
var shapeshift = require('shapeshift.io')

var _request = shapeshift.request
shapeshift.request = function (url, data, callback) {
  console.log('Request to ' + url)
  _request(url, data, callback)
}
```

### CORS

ShapeShift supports CORS so that you can do cross-domain requests in the browser. See
https://shapeshift.io/api.html#cors for more details.

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.cors = true
```

### Promises

Prefer a promise based API? No problem, you can use it out of box (if them [supported](http://kangax.github.io/compat-table/es6/#test-Promise)) or use what you prefer, [Bluebird](https://github.com/petkaantonov/bluebird) for example.

```js
var shapeshift = require('shapeshift.io')
shapeshift.Promise = require('bluebird')
shapeshift.coins().then((data) => console.dir(data))
```

That simple.

## License

MIT
