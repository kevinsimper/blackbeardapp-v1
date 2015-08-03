var React = require('react')
var AppsList = require('./AppsList/')
var Authentication = require('../mixins/authentication')

var Dashboard = React.createClass({
  mixins: [Authentication],
  render: function() {
    return (
      <div>
        <h1>Dashboard</h1>
        <div>Hi there! How are you doing?</div>
        <AppsList/>
      </div>
    );
  }
})

module.exports = Dashboard
