var React = require('react')
var extend = require('lodash/object/extend')
var Apps = require('../Apps/')
var Authentication = require('../../mixins/authentication')
var Onboarding = require('../Onboarding/')
var ProfileActions = require('../Profile/actions')
var ProfileStore = require('../Profile/store')

var Dashboard = React.createClass({
  mixins: [Authentication],
  getState: function() {
    return {
      profile: ProfileStore.getProfile()
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
    this.unsubscribe = ProfileStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    if(!this.state.loaded) {
      return <div/>
    }
    return (
      <div>
        {!this.state.profile.username &&  <Onboarding/>}
        <h1>Dashboard</h1>
        <div>Hi there! How are you doing?</div>
        <Apps/>
      </div>
    );
  }
})

module.exports = Dashboard
