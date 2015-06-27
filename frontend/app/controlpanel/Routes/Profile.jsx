var React = require('react')
var ProfileStore = require('./Profile/Store')

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
        <h1>Profile</h1>
        <div>Name</div>
        <input type='text' value={this.state.profile.name} />
        <div>E-mail</div>
        <input type='text' value={this.state.profile.email} />
        <div>
          <button>Update</button>
        </div>
      </div>
    );
  }
})

module.exports = Profile