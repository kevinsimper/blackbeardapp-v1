var React = require('react')
var classes = require('classnames')
var request = require('superagent')

var BACKEND_HOST = process.env.BACKEND_HOST

var Signup = React.createClass({
  getInitialState: function () {
    return {
      email: '',
      emailValid: false,
      emailInvalid: false,
      password: '',
      passwordValid: false,
      passwordInvalid: false,
      status: ''
    }
  },
  testEmail: function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    return re.test(email)
  },
  onChangeEmail: function (e) {
    var email = e.target.value
    if(this.testEmail(email)) {
      this.setState({
        emailValid: true,
        emailInvalid: false
      })
    }
    this.setState({
      email: email
    })
  },
  onBlurEmail: function (e) {
    var email = e.target.value
    if(!this.testEmail(email)) {
      this.setState({
        emailInvalid: true,
        emailValid: false
      })
    }
  },
  onChangePassword: function (e) {
    this.setState({
      passwordValid: true,
      password: e.target.value
    })
  },
  onSubmit: function (e) {
    var self = this
    e.preventDefault()
    var info = {
      email: this.state.email,
      password: this.state.password
    }
    request.post(BACKEND_HOST + '/users')
      .send(info)
      .end(function(err, res) {
        if(res.status === 400) {
          self.setState({
            status: res.body.message
          })
        } else {
          self.login(info)
        }
      })
  },
  login: function(loginInfo) {
    request.post(BACKEND_HOST + '/login')
      .send(loginInfo)
      .end(function(err, res) {
        localStorage.token = res.body.token
        window.location = '/controlpanel'
      })
  },
  render: function () {
    var emailClasses = classes('SignupPage__Input', {
      'SignupPage__Input--Valid': this.state.emailValid,
      'SignupPage__Input--Invalid': this.state.emailInvalid
    })
    var passwordClasses = classes('SignupPage__Input', {
      'SignupPage__Input--Valid': this.state.passwordValid,
      'SignupPage__Input--Invalid': this.state.passwordInvalid
    })
    return (
      <div className='SignupPage'>
        <h1>Sign up</h1>
        <form onSubmit={this.onSubmit}>
          <div>
            <div>
              <label className='SignupPage__Label' for='email'>Email</label>
            </div>
            <input type='text' name='email' className={emailClasses} value={this.state.email} onChange={this.onChangeEmail} onBlur={this.onBlurEmail}/>
          </div>
          <div>
            <div>
              <label className='SignupPage__Label' for='password'>Password</label>
            </div>
            <input type='password' name='password' className={passwordClasses} value={this.state.password} onChange={this.onChangePassword}/>
          </div>
          <div>
            <button className='SignupPage__button'>Signup</button>
          </div>
          <div className='SignupPage__ErrorMessage'>
            {this.state.status}
          </div>
        </form>
      </div>
    )
  }
})

React.render(<Signup/>, document.querySelector('.signup'))
