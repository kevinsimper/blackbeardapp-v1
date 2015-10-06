var React = require('react');
var auth = require('../../auth')
var Button = require('../Button/')
var ProfileActions = require('../Profile/actions')
var Navigation = require('react-router').Navigation

var Sidebar = React.createClass({
  mixins: [Navigation],
  getInitialState: function () {
    return {
      profile: {}
    }
  },
  componentDidMount: function () {
    var self = this
    ProfileActions.load().then(function (profile) {
      self.setState({
        profile: profile
      })
    })
  },
  onClickLink: function (e) {
    e.preventDefault()
    this.transitionTo(e.target.pathname)
  },
  render: function() {
    return (
      <div className='Sidebar'>
        <div className='Sidebar__Logo'>
          <h2>Blackbeard</h2>
        </div>
        <div className='Sidebar__List'>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="/controlpanel" onClick={this.onClickLink}>Dashboard</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="/controlpanel/profile" onClick={this.onClickLink}>My Profile</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="/controlpanel/images" onClick={this.onClickLink}>Images</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="/controlpanel/usage" onClick={this.onClickLink}>Usage</a>
          </div>
          {this.state.profile.role && (this.state.profile.role === 'ADMIN') &&
            <div>
              <h3 className='Sidebar__DividerTitel'>Admin</h3>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/registry" onClick={this.onClickLink}>Registry</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/preusers" onClick={this.onClickLink}>PreUsers</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/users" onClick={this.onClickLink}>Users</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/billing" onClick={this.onClickLink}>Billing</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/creditlogs" onClick={this.onClickLink}>Credit Logs</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/logs" onClick={this.onClickLink}>Logs</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/clusters" onClick={this.onClickLink}>Clusters</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="/controlpanel/vouchers" onClick={this.onClickLink}>Vouchers</a>
              </div>
            </div>
          }
          <div className='Sidebar__Logout' style={{padding: 10}}>
            <Button onClick={auth.logout}>Log out</Button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Sidebar
