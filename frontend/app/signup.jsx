var React = require('react');
var SignupPopup = require('./SignupPopup.jsx')

var Signup = React.createClass({
  getInitialState: function() {
    return {
      popupShow: false
    };
  },
  componentDidMount: function() {
    window.addEventListener('showSignup', this.onClickSignup);
  },
  componentWillUnmount: function() {
    window.removeEventListener('showSignup', this.onClickSignup);
  },
  onClickSignup: function() {
    this.setState({
      popupShow: true
    })
  },
  onClickClose: function() {
    this.setState({
      popupShow: false
    })
  },
  render: function() {
    return (
      <div>
        <button className="btn-signup" onClick={this.onClickSignup} >Signup now</button>
        <SignupPopup show={this.state.popupShow} closeHandler={this.onClickClose} />
      </div>
    );
  }
});

module.exports = Signup;
