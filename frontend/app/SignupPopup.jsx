var React = require('react');
var classNames = require('classnames');
var request = require('superagent');

var SignupPopup = React.createClass({
  getInitialState: function() {
    return {
      email: '',
      status: ''
    };
  },
  onEmailChange: function(e) {
    this.setState({
      email: e.target.value
    })
  },
  onClickSignup: function(e) {
    var self = this
    request
      .post('/signup')
      .send({
        email: this.state.email
      })
      .end(function(err, res) {
        if(err) {
          self.setState({
            status: 'An error happend!'
          })
        } else {
          self.setState({
            status: 'You successful signup to the waiting list'
          })
        }
      })
  },
  render: function() {
    var classes = classNames({
      'popup': true,
      'popup--visible': this.props.show
    });

    return (
      <div className={classes}>
        <h1>We are not quite ready yet</h1>
        <p>{'But you can sign up and you will get a special invitation when we are ready'}</p>
        <input type="email" placeholder="Email" className="input input__email" onChange={this.onEmailChange} />
        <button className="popup__btn-signup" onClick={this.onClickSignup}>Signup now</button>
        <div>{this.state.status}</div>
      </div>
    );
  }
});

module.exports = SignupPopup;