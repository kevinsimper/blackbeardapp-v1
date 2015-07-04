var React = require('react')
var Navigation = require('react-router').Navigation;
var Link = require('react-router').Link;
var auth = require('../../auth')
var Button = require('../Button/')
var Input = require('../Input/')
var Label = require('../Label/')

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
      <div className='Login'>
        <h1>Login</h1>
        <form onSubmit={this.onSubmit}>
          <Label>Email</Label>
          <Input type="email" value={this.state.username} onChange={this.onUsernameChange} required/>
          <Label>Password</Label>
          <Input type="password" value={this.state.password} onChange={this.onPasswordChange} required/>
          <div>
            <Button type="submit">Log in</Button>
            <Link to='/forgot' className='Login__Forgot'>Forgot password?</Link>
          </div>
          <div>{this.state.message}</div>
        </form>
      </div>
    );
  }
})

module.exports = Login
