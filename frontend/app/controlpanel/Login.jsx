var React = require('react')
var Navigation = require('react-router').Navigation;
var auth = require('./auth')
var Button = require('./components/Button/')
var Input = require('./components/Input/')

var Login = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      username: '',
      password: '',
      message: ''
    };
  },
  onSubmit: function(e) {
    var self = this
    e.preventDefault()
    auth.login(this.state.username, this.state.password, function(err, loggedin) {
      if(err) {
        self.setState({
          message: err.message
        })
      } else {
        self.replaceWith('/')
      }
    })
  },
  onUsernameChange: function(e) {
    this.setState({
      username: e.target.value
    })
  },
  onPasswordChange: function(e) {
    this.setState({
      password: e.target.value
    })
  },
  render: function() {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={this.onSubmit}>
          <div>Email</div>
          <Input type="text" value={this.state.username} onChange={this.onUsernameChange} required/>
          <div>Password</div>
          <Input type="text" value={this.state.password} onChange={this.onPasswordChange} required/>
          <div>
            <Button type="submit">Log in</Button>
          </div>
          <div>{this.state.message}</div>
        </form>
      </div>
    );
  }
})

module.exports = Login