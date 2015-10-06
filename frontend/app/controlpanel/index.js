var React = require('react');
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var config = require('./config')
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
var Vouchers = require('./components/Vouchers/')
var VoucherShow = require('./components/VoucherShow/')
var VoucherCreate = require('./components/VoucherCreate/')
var Registry = require('./components/Registry/')
var CreditLogs = require('./components/CreditLogs/')
var Usage = require('./components/Usage/')
var AppEdit = require('./components/AppEdit/')
var Verify = require('./components/Verify')

var routes = (
  <Route path='/controlpanel' handler={ControlpanelApp}>
    <DefaultRoute handler={Dashboard}/>
    <Route path='login' handler={Login}/>
    <Route path='forgot' handler={ForgotPassword}/>
    <Route path='forgot/:id' handler={ForgotPassword}/>
    <Route path='dashboard' handler={Dashboard}/>
    <Route path='apps/create' handler={AppCreate}/>
    <Route path='apps/:id' handler={AppShow}/>
    <Route path='apps/:id/containers' handler={ContainerFormular}/>
    <Route path='apps/:id/edit' handler={AppEdit}/>
    <Route path='images' handler={Images}/>
    <Route path='billing' handler={Billing}/>
    <Route path='preusers' handler={PreUsersList}/>
    <Route path='preusers/:id' handler={PreUsersShow}/>
    <Route path='profile' handler={Profile}/>
    <Route path='users' handler={Users}/>
    <Route path='users/:id' handler={UserShow}/>
    <Route path='logs' handler={Logs}/>
    <Route path='clusters' handler={Clusters}/>
    <Route path='clusters/:id' handler={ClusterShow}/>
    <Route path='vouchers' handler={Vouchers}/>
    <Route path='vouchers/create' handler={VoucherCreate}/>
    <Route path='vouchers/:id' handler={VoucherShow}/>
    <Route path='registry' handler={Registry}/>
    <Route path='creditlogs' handler={CreditLogs}/>
    <Route path='usage' handler={Usage}/>
    <Route path='verify/:id' handler={Verify}/>
  </Route>
)

if(config.BACKEND_HOST === 'https://api.blackbeard.io') {
  if (window.location.protocol != "https:") {
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
  }
}

Router.run(routes, Router.HistoryLocation, function(Root) {
  React.render(<Root/>, document.querySelector('#adminapp'))
})
