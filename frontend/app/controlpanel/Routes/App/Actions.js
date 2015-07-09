var Reflux = require('reflux')

var actions = Reflux.createActions({
  load: {
    asyncResult: true
  },
  new: {
    asyncResult: true
  },
  del: {
    asyncResult: true
  }
})

module.exports = actions
