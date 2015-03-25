var React = require('react');
var SignupPopup = require('./SignupPopup.jsx')

var Signup = React.createClass({
  getInitialState: function() {
    return {
      popupShow: false
    };
  },
  onClickSignup: function() {
    this.setState({
      popupShow: true
    })
  },
  render: function() {
    return (
      <div>
        <button className="btn-signup" onClick={this.onClickSignup} >Signup now</button>
        <SignupPopup show={this.state.popupShow} />
      </div>
    );
  }
});

module.exports = Signup;