var React = require('react')
var Router = require('react-router')
var Store = require('./Store')

var PreUsersShow = React.createClass({
  mixins: [Router.State],
  render: function() {
    var id = this.getParams().id
    return (
      <div>
        <h2>Show</h2>
        <div>{id}</div>
      </div>
    );
  }
})

module.exports = PreUsersShow