var React = require('react');
var auth = require('../../auth')
var Button = require('../Button/')
var ProfileActions = require('../Profile/actions')

var Sidebar = React.createClass({
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
  render: function() {
    return (
      <div className='Sidebar'>
        <div className='Sidebar__Logo'>
          <h2>Blackbeard</h2>
        </div>
        <div className='Sidebar__List'>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/">Dashboard</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/profile">My Profile</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/images">Images</a>
          </div>
          {this.state.profile.role && (this.state.profile.role === 'ADMIN') &&
            <div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/registry">Registry</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/preusers">PreUsers</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/users">Users</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/billing">Billing</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/logs">Logs</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/clusters">Clusters</a>
              </div>
              <div className='Sidebar__Item'>
                <a className='Sidebar__Link' href="#/vouchers">Vouchers</a>
              </div>
            </div>
          }
          <div className='Sidebar__Item' style={{padding: 10}}>
            <Button onClick={auth.logout}>Log out</Button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Sidebar
