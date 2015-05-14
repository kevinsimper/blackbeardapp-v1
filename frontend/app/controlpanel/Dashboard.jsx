var React = require('react')
var AppsList = require('./AppsList.jsx')

var Dashboard = React.createClass({
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