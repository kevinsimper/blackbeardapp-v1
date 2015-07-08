var React = require('react');
var SignupPopup = require('./SignupPopup.jsx')
var request = require('superagent')
var queue = require('./queue')

var Signup = React.createClass({
  getInitialState: function() {
    return {
      popupShow: false,
      queue: false
    };
  },
  componentDidMount: function() {
    var self = this
    window.addEventListener('showSignup', this.onClickSignup);
    var email = queue.getEmail()
    if(email) {
      queue.getNumber(email, function(err, res) {
        self.setState({
          queue: res.body.number
        })
      })
    }
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
        {this.state.queue && <div>You have already signed up and are number {this.state.queue}</div>}
      </div>
    );
  }
});

module.exports = Signup;
