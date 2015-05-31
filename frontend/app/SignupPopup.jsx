var React = require('react');
var classNames = require('classnames');
var request = require('superagent');

var BACKEND_HOST = process.env.BACKEND_HOST;

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
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    request
      .post(BACKEND_HOST + '/presignup')
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
            status: res.body.status,
            email: ''
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
        <form onSubmit={this.onSubmit}>
          <input type="email" placeholder="Email" className="input input__email" onChange={this.onEmailChange} value={this.state.email} required/>
          <button type="submit" className="popup__btn-signup">Signup now</button>
          <button className="popup__btn-close" onClick={this.props.closeHandler}>Close</button>
          <div>{this.state.status}</div>
        </form>
      </div>
    );
  }
});

module.exports = SignupPopup;