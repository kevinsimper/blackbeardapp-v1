var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var ControlpanelApp = require('./AdminApp.jsx')
var Dashboard = require('./Dashboard.jsx')
var AppsList = require('./AppsList.jsx')
var Profile = require('./Profile.jsx')
var AppCreate = require('./App/Create.jsx')
var AppShow = require('./App/Show.jsx')
var PreUsersList = require('./PreUsers/List.jsx')
var Login = require('./Login.jsx')

console.log(process.env.BACKEND_HOST)

var routes = (
  <Route handler={ControlpanelApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route name='login' handler={Login}/>
    <Route name='dashboard' handler={Dashboard}/>
    <Route name='app' path='/app'>
      <Route path='create' handler={AppCreate}/>
      <Route name="AppShow" path='show/:id' handler={AppShow}/>
    </Route>
    <Route path='/preusers' handler={PreUsersList}/>
    <Route path='profile' handler={Profile}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
