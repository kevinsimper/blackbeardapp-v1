var Reflux = require('reflux')

var actions = Reflux.createActions({
  load: {
    children: ['completed', 'failed']
  }
})

module.exports = actions