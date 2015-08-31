var Reflux = require('reflux')

module.exports = Reflux.createActions({
  'load': {
    asyncResult: true
  },
  'new': {
    asyncResult: true
  },
  'claim': {
    asyncResult: true
  }
})
