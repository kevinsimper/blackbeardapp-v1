var React = require('react')
var Sidebar = require('../Sidebar/');
var Router = require('react-router')
var RouteHandler = Router.RouteHandler
var Navigation = Router.Navigation
var auth = require('../../auth')

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
      <div className='ControlpanelApp'>
        <div className='ControlpanelApp__Sidebar'>
          {this.state.loggedIn && <Sidebar/>}
        </div>
        <div className='ControlpanelApp__Content'>
          <RouteHandler/>
        </div>
      </div>
    )
  }
})

module.exports = ControlpanelApp
