var React = require('react')
var Label = require('../Label/')
var Input = require('../Input/')
var Button = require('../Button/')
var request = require('superagent')
var config = require('../../config')
var auth = require('../../auth')
var Navigation = require('react-router').Navigation

var ForgotPassword = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      email: '',
      loading: false,
      message: ''
    }
  },
  onClickRequest: function() {
    var self = this
    this.setState({
      loading: true
    })
    request.post(config.BACKEND_HOST + '/forgot')
    .send({
      email: this.state.email
    })
    .end(function(err, res) {
      self.setState({
        loading: false,
        message: res.body.message
      })
    })
  },
  handleEmailChange: function(e) {
    this.setState({
      email: e.target.value
    })
  },
  handlePasswordChange: function(e) {
    this.setState({
      password: e.target.value
    })
  },
  onClickChange: function() {
    var self = this
    this.setState({
      loading: true
    })
    request.post(config.BACKEND_HOST + '/forgot/' + this.props.params.id)
    .send({
      password: this.state.password
    })
    .end(function(err, res) {
      if(err) {
        self.setState({
          loading: false,
          message: res.body.message || res.body.error
        })
        return false
      }
      self.setState({
        loading: false,
        message: res.body.message
      })
      auth.setToken(res.body.token)
      auth.onChange(true)
      self.replaceWith('/')
    })
  },
  render: function() {

    var requestForm = (
      <div>
        <h1>Forgot Password</h1>
        <div>You will receive a email with a link you will have to click.</div>
        <Label>Email</Label>
        <Input type='email' placeholder='me@example.com' value={this.state.email} onChange={this.handleEmailChange}/>
        <div>
          <Button onClick={this.onClickRequest}>Request password change</Button>
        </div>
      </div>
    )

    var changePasswordForm = (
      <div>
        <h1>Change password</h1>
        <Label>Password</Label>
        <Input type='password' value={this.props.password} onChange={this.handlePasswordChange} />
        <div>
          <Button onClick={this.onClickChange}>Change password</Button>
        </div>
      </div>
    )

    if(this.props.params.id) {
      var content = changePasswordForm
    } else {
      var content = requestForm
    }
    return (
      <div className="ForgotPassword">
        {content}
        {this.state.loading && <div>Loading</div>}
        {this.state.message}
      </div>
    )

  }
})

module.exports = ForgotPassword
