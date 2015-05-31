var Reflux = require('reflux')

var actions = Reflux.createActions({
  load: {
    children: ['completed', 'failed']
  },
  del: {
    children: ['completed', 'failed']
  }
})

module.exports = actions