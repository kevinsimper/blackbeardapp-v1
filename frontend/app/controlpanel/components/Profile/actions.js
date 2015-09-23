var Reflux = require('reflux')

var actions = Reflux.createActions({
  'load': {
    asyncResult: true
  },
  update: {
    asyncResult: true
  },
  verifyUserEmail: {
    asyncResult: true
  }
})

module.exports = actions
