'use strict'
var shapeshift = require('./browser')
shapeshift.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

module.exports = shapeshift
