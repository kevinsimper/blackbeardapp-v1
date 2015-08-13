var Reflux = require('reflux')

var actions = Reflux.createActions({
  loadOne: {
    asyncResult: true
  },
  stopOne: {
    asyncResult: true
  },
})

module.exports = actions
