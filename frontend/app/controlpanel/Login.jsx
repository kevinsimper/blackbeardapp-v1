var React = require('react')
var Navigation = require('react-router').Navigation;
var auth = require('./auth')

var Login = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      'username': '',
      'password': ''
    };
  },
  onSubmit: function(e) {
    var self = this
    e.preventDefault()
    auth.login(this.state.username, this.state.password, function() {
      self.replaceWith('/')
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
          <input type="text" value={this.state.username} onChange={this.onUsernameChange} required/>
          <div>Password</div>
          <input type="text" value={this.state.password} onChange={this.onPasswordChange} required/>
          <div>
            <button type="submit">Log in</button>
          </div>
        </form>
      </div>
    );
  }
})

module.exports = Login