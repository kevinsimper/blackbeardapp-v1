var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var AdminApp = require('./AdminApp.jsx')
var Link = Router.Link

var AppsList = React.createClass({
  render: function() {
    var apps = [{name: 'awesome-app'}, {name: 'docker-fun'}]
    return (
      <div>
        <Link to='/app/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {apps.map(function(item){
            return <div>{item.name}</div>;
          })}
        </div>
      </div>
    );
  }
})

var AppCreate = React.createClass({
  render: function() {
    return <div><h1>Create app</h1></div>;
  }
})

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

var Profile = React.createClass({
  render: function() {
    return <div><h1>Profile</h1></div>;
  }
})

var routes = (
  <Route handler={AdminApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route name='dashboard' handler={Dashboard}/>
    <Route name='app'>
      <Route name='create' handler={AppCreate}/>
    </Route>
    <Route path='profile' handler={Profile}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
