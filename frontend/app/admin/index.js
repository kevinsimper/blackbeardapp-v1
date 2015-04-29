var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute

var Header = require('./Header.jsx');
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


var Dashboard = React.createClass({
  render: function() {
    return <div>Dashboard</div>;
  }
})

var Profile = React.createClass({
  render: function() {
    return <div>Profile</div>;
  }
})



var routes = (
  <Route handler={AdminApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route path='dashboard' handler={Dashboard}/>
    <Route path='profile' handler={Profile}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
