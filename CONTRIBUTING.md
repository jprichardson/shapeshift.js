## Wanna Hack on shapeshift.io package?

Awesome. First, this package uses [JavaScript Standard Style](https://github.com/feross/standard).

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

You'll want to setup two private keys ([WIF](https://en.bitcoin.it/wiki/Wallet_import_format)) so that you can actually test the shifting. Set these as environment
variables. Make one for Bitcoin (BTC) and the other for Litecoin (LTC). You'll be using real funds. But don't worry,
it's small amounts (a few pennies).

```shell
# shapeshift API testing
export SS_BTC_WIF=K....
export SS_LTC_WIF=T....
```

Then run the tests:

```shell
npm test
```
