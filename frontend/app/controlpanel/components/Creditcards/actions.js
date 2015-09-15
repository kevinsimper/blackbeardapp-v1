var Reflux = require('reflux')

var Actions = Reflux.createActions({
  load: {
    asyncResult: true
  },
  new: {
    asyncResult: true
  },
  activate: {
    asyncResult: true
  },
  del: {
    asyncResult: true
  }
})

module.exports = Actions
