var React = require('react')
var Input = require('../Input/')
var Label = require('../Label/')
var Button = require('../Button/')
var request = require('superagent')
var config = require('../../config')
var classNames = require('classnames')

var Onboarding = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      status: '',
      error: ''
    }
  },
  onChangeUsername: function(e) {
    this.setState({
      username: e.target.value
    })
  },
  onClickSave: function() {
    var self = this

    if(this.state.username.length === 0) {
      self.setState({
        error: 'You have to fill out a username!'
      })
    }
    request.post(config.BACKEND_HOST + '/users/me/username')
      .set('Authorization', localStorage.token)
      .send({
        username: this.state.username
      })
      .end(function(err, res) {
        if(err && err.statusCode < 300) {
          self.setState({
            status: res.body.message,
            error: ''
          })
        } else {
          self.setState({
            error: '',
            status: res.body.message
          })
        }
      })
  },
  inputClasses: function () {
    return classNames('Onboarding__Username', {
      'Onboarding__Username--Valid': this.state.username.length > 0,
      'Onboarding__Username--Invalid': this.state.error && this.state.username.length === 0
    })
  },
  render: function() {
    return (
      <div className="Onboarding">
        <h1>Getting started using Blackbeard</h1>
        <p>There is some things that you need to do before you can get started using Blackbeard.</p>
        <p>You have to specify a username, that you ar going to use, when you log in to the registry.</p>
        <Label>What is your registry username?</Label>
        <div className={this.inputClasses()}>
          <Input type='text' value={this.state.username} onChange={this.onChangeUsername}/>
        </div>
        <div>
          <Button onClick={this.onClickSave}>Save</Button>
        </div>
        <div>{this.state.status}</div>

        <p>You are going to that username like this:</p>
        <div className='Onboarding__Terminal'>
          <pre>
            <code>$ docker login -u {this.state.username} registry.blackbeard.io</code>
          </pre>
          <pre>
            <code>$ docker push registry.blackbeard.io/{this.state.username}/container</code>
          </pre>
        </div>
      </div>
    )
  }
})

module.exports = Onboarding
