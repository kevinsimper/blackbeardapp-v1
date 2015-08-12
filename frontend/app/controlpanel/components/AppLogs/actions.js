var Reflux = require('reflux')

var actions = Reflux.createActions({
  loadOne: {
    asyncResult: true
  }
})

module.exports = actions
