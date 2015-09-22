var React = require('react')
var extend = require('lodash/object/extend')
var Reflux = require('reflux')
var Apps = require('../Apps/')
var Button = require('../Button/')
var Authentication = require('../../mixins/authentication')
var Onboarding = require('../Onboarding/')
var ProfileActions = require('../Profile/actions')
var ProfileStore = require('../Profile/store')
var AppsStore = require('../Apps/store')
var Navigation = require('react-router').Navigation;

var Dashboard = React.createClass({
  mixins: [Authentication, Navigation, Reflux.ListenerMixin],
  getState: function() {
    return {
      profile: ProfileStore.getProfile(),
      apps: AppsStore.getApps()
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    ProfileActions.load()
    .then(function() {
      self.setState({
        loaded: true
      })
    })
    this.listenTo(ProfileStore, this.onChange)
    this.listenTo(AppsStore, this.onChange)
  },
  onChange: function() {
    this.setState(this.getState())
  },
  onClickCreate: function () {
    this.transitionTo('/apps/create')
  },
  render: function() {
    if(!this.state.loaded) {
      return <div/>
    }
    if(!this.state.profile.username) {
      return <Onboarding/>;
    }
    return (
      <div>
        <h1>Dashboard</h1>
        {this.state.apps.length === 0 &&
          <div>
            <div>You have not created any apps, go and create your first app! It is easier than you think!</div>
            <Button onClick={this.onClickCreate} style={{fontSize: '1.4em'}}>Create New App</Button>
            <div>
              <small>Button is larger than default, just so that you don't miss it! Serious, go check it out! ;-)</small>
            </div>
          </div>
        }
        {this.state.apps.length > 0 &&
          <div>
            <div>Hi there! How are you doing?</div>
            <Button onClick={this.onClickCreate}>Create New App</Button>
            <h2>My Apps</h2>
            <Apps/>
          </div>
        }
      </div>
    );
  }
})

module.exports = Dashboard
