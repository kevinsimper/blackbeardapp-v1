var React = require('react')
var Label = require('../Label/')
var Input = require('../Input/')
var Button = require('../Button/')
var request = require('superagent')
var config = require('../../config')

var ForgotPassword = React.createClass({
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
        message: res.body.status
      })
    })
  },
  handleEmailChange: function(e) {
    this.setState({
      email: e.target.value
    })
  },
  render: function() {
    return (
      <div className="ForgotPassword">
        <h1>Forgot Password</h1>
        <div>You will receive a email with a link you will have to click.</div>
        <Label>Email</Label>
        <Input type='email' placeholder='me@example.com' value={this.state.email} onChange={this.handleEmailChange}/>
        <div>
          <Button onClick={this.onClickRequest}>Request password change</Button>
        </div>
        {this.state.loading && <div>Loading</div>}
        {this.state.message}
      </div>
    )
  }
})

module.exports = ForgotPassword
