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
    // if you have used 1024mb and you are running 2 clusters
    var percentageUsed = Math.round((this.state.usage.limit ? (this.state.usage.memoryUsed / this.state.usage.limit) : 0)*100)

    return (
      <div className='ClusterUsage'>
        Total Memory Used: {this.state.usage.memoryUsed}, Total Containers: {this.state.usage.count}, Percentage Used: {percentageUsed}
      </div>
    )
  }
})

module.exports = ClusterUsage
