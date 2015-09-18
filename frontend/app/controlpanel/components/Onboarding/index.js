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
      error: '',
      success: false
    }
  },
  onChangeUsername: function(e) {
    this.setState({
      username: e.target.value
    })
  },
  onClickSave: function(e) {
    e.preventDefault()
    var self = this

    if(this.state.username.length === 0) {
      self.setState({
        error: 'You have to fill out a username!'
      })
      return false;
    }
    request.post(config.BACKEND_HOST + '/users/me/username')
      .set('Authorization', localStorage.token)
      .send({
        username: this.state.username
      })
      .end(function(err, res) {
        if(err && res.status > 300) {
          self.setState({
            status: '',
            error: res.body.message
          })
        } else {
          self.setState({
            error: '',
            status: res.body.message,
            success: true
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
  goToNext: function () {
    window.location.reload()
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
        {!this.state.success &&
          <div>
            <Button onClick={this.onClickSave}>Save</Button>
          </div>
        }
        {this.state.status &&
          <div className='Onboarding__Success'>
            {this.state.status}
          </div>
        }
        {this.state.error &&
          <div className='Onboarding__Error'>
            {this.state.error}
          </div>
        }
        <p>You are going to that username like this:</p>
        <div className='Onboarding__Terminal'>
          <pre>
            <code>$ docker login -u {this.state.username} registry.blackbeard.io</code>
          </pre>
          <pre>
            <code>$ docker push registry.blackbeard.io/{this.state.username}/container</code>
          </pre>
        </div>
        {this.state.success &&
          <div style={{marginTop: 40}}>
            <Button onClick={this.goToNext}>Go to dashboard!</Button>
          </div>
        }
      </div>
    )
  }
})

module.exports = Onboarding
