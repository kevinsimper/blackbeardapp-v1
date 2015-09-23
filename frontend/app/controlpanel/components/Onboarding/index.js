var React = require('react')
var Input = require('../Input/')
var Label = require('../Label/')
var Button = require('../Button/')
var Select = require('../Select')
var request = require('superagent')
var config = require('../../config')
var classNames = require('classnames')
var countries = require('country-data').countries

var Onboarding = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      country: false,
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
  onChangeCountry: function(e) {
    this.setState({
      country: e.target.value
    })
  },
  onClickSave: function(e) {
    e.preventDefault()
    var self = this

    if (this.state.country === false) {
      this.state.country = ''
    }

    if ((this.state.username.length === 0) || (this.state.country === '')) {
      var field = 'username'
      if ((this.state.username.length === 0) && (this.state.country === '')) {
        field = 'username and country'
      } else if (this.state.country === '') {
        field = 'country'
      }
      self.setState({
        error: 'You have to fill out a ' + field + '!'
      })
      return
    }

    if (this.state.username.length < 3) {
      self.setState({
        error: 'Your username must be over 3 characters!'
      })
      return
    }

    request.post(config.BACKEND_HOST + '/users/me/onboarding')
      .set('Authorization', localStorage.token)
      .send({
        username: this.state.username,
        country: this.state.country
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
  inputClassesUsername: function () {
    return classNames('Onboarding__Username', {
      'Onboarding__Username--Valid': this.state.username.length > 0 && this.state.username.length > 3,
      'Onboarding__Username--Invalid': this.state.error && this.state.username.length < 3
    })
  },
  inputClassesCountry: function () {
    return classNames('Select', {
      'Onboarding__Country--Valid': this.state.country,
      'Onboarding__Country--Invalid': this.state.country === '',

    })
  },
  goToNext: function () {
    window.location.reload()
  },
  render: function() {
    var self = this
    return (
      <div className="Onboarding">
        <h1>Getting started using Blackbeard</h1>
        <p>There is some things that you need to do before you can get started using Blackbeard.</p>
        <p>You have to specify a username, that you are going to use when you log into the registry.</p>
        <Label>What is your registry username?</Label>
        <div className={this.inputClassesUsername()}>
          <Input type='text' value={this.state.username} onChange={this.onChangeUsername}/>
        </div>
        <Label>What country are you in?</Label>
        <div>
          <Select className={this.inputClassesCountry()} onChange={this.onChangeCountry}>
            <option value="">-</option>
            {countries.all.map(function(country) {
              return <option selected={country.alpha2 == self.state.country} value={country.alpha2}>{country.name}</option>
            })}
          </Select>
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
        <p>You are going to use your username like this:</p>
        <div className='Onboarding__Terminal'>
          <pre>
            <code>$ docker login -u {this.state.username || '[username]'} registry.blackbeard.io</code>
          </pre>
          <pre>
            <code>$ docker push registry.blackbeard.io/{this.state.username || '[username]'}/container</code>
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
