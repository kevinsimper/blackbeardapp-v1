var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var ControlpanelApp = require('./components/ControlpanelApp/')
var Dashboard = require('./Routes/Dashboard.jsx')
var Profile = require('./components/Profile/')
var AppCreate = require('./Routes/App/Create.jsx')
var AppShow = require('./Routes/App/Show.jsx')
var PreUsersList = require('./Routes/PreUsers/List.jsx')
var PreUsersShow = require('./Routes/PreUsers/Show.jsx')
var Login = require('./components/Login/')
var ForgotPassword = require('./components/ForgotPassword/')
var Users = require('./components/Users')

var routes = (
  <Route handler={ControlpanelApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route name='login' handler={Login}/>
    <Route name='forgot' handler={ForgotPassword}/>
    <Route path='/forgot/:id' handler={ForgotPassword}/>
    <Route name='dashboard' handler={Dashboard}/>
    <Route name='app' path='/app'>
      <Route path='create' handler={AppCreate}/>
      <Route name="AppShow" path='show/:id' handler={AppShow}/>
    </Route>
    <Route path='/preusers' handler={PreUsersList}/>
    <Route name='preuser' path='/preusers/:id' handler={PreUsersShow}/>
    <Route path='profile' handler={Profile}/>
    <Route path='/users' handler={Users}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
