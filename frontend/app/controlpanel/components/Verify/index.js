var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Button = require('../Button/')
var SuccessMessage = require('../SuccessMessage/')
var Navigation = require('react-router').Navigation

var Verify = React.createClass({
  mixins: [Navigation],
  getInitialState: function () {
    return {
      verified: false
    }
  },
  onClickVerify: function () {
    var self = this
    request
      .get(config.BACKEND_HOST + '/verify/' + this.props.params.id)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        self.setState({
          verified: true
        })
      })
  },
  render: function () {
    return (
      <div className='Verify'>
        <h1>Nearly there!</h1>
        <p>Thank you for verifying your email!</p>
        {!this.state.verified &&
          <Button onClick={this.onClickVerify}>Click here to verify!</Button>
        }
        {this.state.verified &&
          <SuccessMessage>
            <div>Success!</div>
            <Button onClick={this.transitionTo.bind(this, '/controlpanel')}>Go to Dashboard</Button>
          </SuccessMessage>
        }
      </div>
    )
  }
})

module.exports = Verify
