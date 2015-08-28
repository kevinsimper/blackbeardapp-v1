var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Snippet = require('../Snippet')
var Table = require('../Table')

var ClusterStatus = React.createClass({
  getInitialState: function () {
    return {
      status: {}
    }
  },
  componentDidMount: function () {
    var self = this
    request.get(config.BACKEND_HOST + '/clusters/' + this.props.cluster + '/status')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        self.setState({
          status: res.body
        })
      })
  },
  render: function () {
    return (
      <div className='ClusterStatus'>
        <h2>Cluster Status</h2>
        <pre>
          <Snippet>
            {JSON.stringify(this.state.status, null, 2)}
          </Snippet>
        </pre>
      </div>
    )
  }
})

module.exports = ClusterStatus
