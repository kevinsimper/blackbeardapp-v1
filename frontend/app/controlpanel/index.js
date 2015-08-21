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
var Images = require('./components/Images/')
var Billing = require('./components/Billing/')
var ContainerFormular = require('./components/ContainersFormular/')
var Logs = require('./components/Logs/')
var Clusters = require('./components/Clusters/')
var ClusterShow = require('./components/ClusterShow/')

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
      <Route path=':id/containers' handler={ContainerFormular}/>
    </Route>
    <Route path='/images' handler={Images}/>
    <Route path='/billing' handler={Billing}/>
    <Route path='/preusers' handler={PreUsersList}/>
    <Route name='preuser' path='/preusers/:id' handler={PreUsersShow}/>
    <Route path='profile' handler={Profile}/>
    <Route path='/users' handler={Users}/>
    <Route path='/users/:id' handler={UserShow}/>
    <Route path='/logs' handler={Logs}/>
    <Route path='/clusters' handler={Clusters}/>
    <Route path='/clusters/:id' handler={ClusterShow}/>
  </Route>
)

Router.run(routes, Router.HashLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
