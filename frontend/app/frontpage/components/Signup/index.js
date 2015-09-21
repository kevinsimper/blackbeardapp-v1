var React = require('react');
var SignupPopup = require('../SignupPopup/')
var request = require('superagent')
var queue = require('../../queue')

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
    window.location.href = '/signup'
  },
  onClickClose: function() {
    this.setState({
      popupShow: false
    })
  },
  render: function() {
    return (
      <div>
        <button className="btn-signup" onClick={this.onClickSignup}>Signup now</button>
        <SignupPopup show={this.state.popupShow} closeHandler={this.onClickClose} />
        {this.state.queue && <h4 style={{marginBottom: 0}}>You have already signed up and are number {this.state.queue} in the queue!</h4>}
      </div>
    );
  }
});

module.exports = Signup;
