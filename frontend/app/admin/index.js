var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var AdminApp = require('./AdminApp.jsx')
var Dashboard = require('./Dashboard.jsx')
var AppsList = require('./AppsList.jsx')
var Profile = require('./Profile.jsx')
var AppCreate = require('./App/Create.jsx')


var routes = (
  <Route handler={AdminApp}>
    <DefaultRoute handler={Dashboard} path='/'/>
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
