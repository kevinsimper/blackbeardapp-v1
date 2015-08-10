var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var ControlpanelApp = require('./components/ControlpanelApp/')
var Dashboard = require('./components/Dashboard/')
var Profile = require('./components/Profile/')
var AppCreate = require('./components/AppCreate/')
var AppShow = require('./components/AppShow/')
var PreUsersList = require('./Routes/PreUsers/List.jsx')
var PreUsersShow = require('./Routes/PreUsers/Show.jsx')
var Login = require('./components/Login/')
var ForgotPassword = require('./components/ForgotPassword/')
var Users = require('./components/Users')
var UserShow = require('./components/UserShow/')

var routes = (
  <Route handler={ControlpanelApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route name='login' handler={Login}/>
    <Route name='forgot' handler={ForgotPassword}/>
    <Route path='/forgot/:id' handler={ForgotPassword}/>
    <Route name='dashboard' handler={Dashboard}/>
    <Route name='app' path='/apps'>
      <Route path='create' handler={AppCreate}/>
      <Route name="AppShow" path=':id' handler={AppShow}/>
    </Route>
    <Route path='/preusers' handler={PreUsersList}/>
    <Route name='preuser' path='/preusers/:id' handler={PreUsersShow}/>
    <Route path='profile' handler={Profile}/>
    <Route path='/users' handler={Users}/>
    <Route path='/users/:id' handler={UserShow}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
