var React = require('react')
var Input = require('../Input/')
var Label = require('../Label/')
var Button = require('../Button/')
var request = require('superagent')
var config = require('../../config')

var Onboarding = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      status: ''
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
      return alert('You have to fill out a username!')
    }
    request.post(config.BACKEND_HOST + '/users/me/username')
      .set('Authorization', localStorage.token)
      .send({
        username: this.state.username
      })
      .end(function(err, res) {
        self.setState({
          status: res.body.message
        })
      })
  },
  render: function() {
    return (
      <div className="Onboarding">
        <h1>Getting started</h1>
        <Label>What is your registry username?</Label>
        <Input type='text' value={this.state.username} onChange={this.onChangeUsername}/>
        <div>
          <Button onClick={this.onClickSave}>Save</Button>
        </div>
        <div>{this.state.status}</div>
        <div>
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
