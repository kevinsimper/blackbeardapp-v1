var React = require('react')
var Header = require('./Header.jsx');
var Router = require('react-router')
var RouteHandler = Router.RouteHandler

var AdminApp = React.createClass({
  render: function() {
    return (
      <div>
        <Header/>
        <RouteHandler/>
      </div>
    );
  }
});

module.exports = AdminApp;
