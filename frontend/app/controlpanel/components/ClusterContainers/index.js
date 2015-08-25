var React = require('react')
var request = require('superagent')
var config = require('../../config')

var ClusterContainers = React.createClass({
  getInitialState: function () {
    return {
      containers: {}
    }
  },
  componentDidMount: function () {
    var self = this
    request.get(config.BACKEND_HOST + '/clusters/' + this.props.cluster + '/containers')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        self.setState({
          containers: res.body
        })
      })
  },
  render: function () {
    return (
      <div className='ClusterContainers'>
        <h2>Containers</h2>
        <pre>
          {JSON.stringify(this.state.containers, null, 2)}
        </pre>
      </div>
    )
  }
})

module.exports = ClusterContainers
