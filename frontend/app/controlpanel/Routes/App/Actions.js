var Reflux = require('reflux')

var actions = Reflux.createActions({
  "new": {
    asyncResult: true
  }
})

module.exports = actions