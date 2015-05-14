var React = require('react')
var Header = require('./Header.jsx');
var Router = require('react-router')
var RouteHandler = Router.RouteHandler
var Navigation = Router.Navigation
var auth = require('./auth')

var ControlpanelApp = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      loggedIn: auth.loggedIn()
    };
  },
  setStateOnAuth: function (loggedIn) {
    this.setState({
      loggedIn: loggedIn
    });
    if(!loggedIn) {
      this.replaceWith('/login')
    }
  },
  componentWillMount: function() {
    auth.onChange = this.setStateOnAuth
  },
  render: function() {
    return (
      <div>
        {this.state.loggedIn && <Header/>}
        <RouteHandler/>
      </div>
    );
  }
});

module.exports = ControlpanelApp;
