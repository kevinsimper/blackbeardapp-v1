var Reflux = require('reflux')

var Actions = Reflux.createActions({
  load: {
    asyncResult: true
  },
  new: {
    asyncResult: true
  }
})

module.exports = Actions
