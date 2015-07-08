var React = require('react')
var classNames = require('classnames')
var request = require('superagent')
var queue = require('./queue')


var BACKEND_HOST = process.env.BACKEND_HOST;

var SignupPopup = React.createClass({
  getInitialState: function() {
    return {
      email: '',
      status: '',
      submitted: false
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
          return false
        }
        var email = self.state.email
        queue.getNumber(email, function(err, res) {
          self.setState({
            queue: res.body.number
          })
          queue.setEmail(email)
        })
        self.setState({
          status: res.body.status,
          email: '',
          submitted: true
        })

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
        {!this.state.submitted && <p>{'But you can sign up and you will get a special invitation when we are ready'}</p>}
        <form onSubmit={this.onSubmit}>
          {!this.state.submitted && <input type="email" placeholder="Email" className="input input__email" onChange={this.onEmailChange} value={this.state.email} required/>}
          {!this.state.submitted && <button type="submit" className="popup__btn-signup">Signup now</button>}
          {!this.state.submitted && <button className="popup__btn-close" onClick={this.props.closeHandler}>Close</button>}
          <h2>{this.state.status}</h2>
          {typeof this.state.queue == 'number' && <div>You are number {this.state.queue} in the queue!</div>}
        </form>
      </div>
    );
  }
});

module.exports = SignupPopup;
