var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Snippet = require('../Snippet')
var Table = require('../Table')

var ClusterUsage = React.createClass({
  getInitialState: function () {
    return {
      usage: {}
    }
  },
  componentDidMount: function () {
    var self = this
    request.get(config.BACKEND_HOST + '/clusters/usage')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        self.setState({
          usage: res.body
        })
      })
  },
  render: function () {
    var percentageUsed = this.state.usage.count ? (this.state.usage.memoryUsed / this.state.usage.count) : 0

    return (
      <div className='ClusterUsage'>
        Total Memory Used: {this.state.usage.memoryUsed}, Total Clusters: {this.state.usage.count}, Percentage Used: {percentageUsed}
      </div>
    )
  }
})

module.exports = ClusterUsage
