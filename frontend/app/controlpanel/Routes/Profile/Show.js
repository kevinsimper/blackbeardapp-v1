var React = require('react')
var ProfileStore = require('./Store')
var Input = require('../../components/Input/')
var Button = require('../../components/Button/')
var Payment = require('../../components/Payment/')

var getState = function() {
  return {
    profile: ProfileStore.getProfile()
  };
}

var Profile = React.createClass({
  getInitialState: function() {
    return getState();
  },
  handleNameChange: function() {
    this
  },
  handleEmailChange: function() {

  },
  render: function() {
    return (
      <div>
        <div>
          <h1>Profile</h1>
          <div>Name</div>
          <Input type='text' value={this.state.profile.name} />
          <div>E-mail</div>
          <Input type='text' value={this.state.profile.email} />
          <div>
            <Button>Update</Button>
          </div>
        </div>
        <Payment/>
      </div>
    );
  }
})

module.exports = Profile
