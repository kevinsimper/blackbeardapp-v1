var Reflux = require('reflux')

module.exports = Reflux.createActions({
  'load': {
    asyncResult: true
  },
  'del': {
    asyncResult: true
  }
})
