var React = require('react')
var extend = require('lodash/object/extend')
var Reflux = require('reflux')
var Apps = require('../Apps/')
var Button = require('../Button/')
var Authentication = require('../../mixins/authentication')
var Onboarding = require('../Onboarding/')
var ErrorMessage = require('../ErrorMessage/')
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
      loaded: false,
      loadingVerify: false
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
  onClickCreditCard: function () {
    this.transitionTo('/profile')
  },
  onClickVerify: function () {
    var self = this
    this.setState({
      loadingVerify: true
    })

    ProfileActions.verifyUserEmail()
      .then(function(result) {
        self.setState({
          loadingVerify: false
        })
      })
      .catch(function(err) {
        self.setState({
          loadingVerify: false
        })
      })
  },
  isCreditcardDone: function() {
    return this.state.profile &&
      this.state.profile.creditCards &&
      this.state.profile.creditCards.length > 0
  },
  render: function() {
    if(!this.state.loaded) {
      return <div/>
    }
    if(!this.state.profile.username) {
      return <Onboarding/>
    }
    return (
      <div>
        <h1>Dashboard</h1>
        {!this.state.profile.verified &&
          (this.state.profile.verificationSendStatus === undefined ||
          this.state.profile.verificationSendStatus === false) &&
          <div>
            <div>To use Blackbeard you need to verify your email address</div>
            {this.state.loadingVerify &&
              <span>Loading...</span>
            }
            {!this.state.loadingVerify &&
              <Button onClick={this.onClickVerify}>Resend Verification Email</Button>
            }
            {this.state.profile.verificationSendStatus === false &&
              <ErrorMessage>Verification email could not be sent</ErrorMessage>
            }
          </div>
        }
        {!this.state.profile.verified &&
          this.state.profile.verificationSendStatus === true &&
          <div style={{fontWeight: 'bold', marginBottom: '1em'}}>
            Verification email sent.
          </div>
        }
        {!this.isCreditcardDone() &&
          <div style={{marginBottom: '1em'}}>
            <div>To deploy containers on Blackbeard you need to supply a credit card!</div>
            <Button onClick={this.onClickCreditCard}>Enter Card Details</Button>
          </div>
        }
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
