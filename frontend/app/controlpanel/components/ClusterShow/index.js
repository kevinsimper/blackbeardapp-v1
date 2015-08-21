var React = require('react')
var Reflux = require('reflux')
var extend = require('lodash/object/extend')
var ClusterActions = require('../Clusters/actions')
var ClusterStore = require('../Clusters/store')
var Table = require('../Table')

var ClusterShow = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getState: function () {
    return {
      cluster: ClusterStore.getOne(this.props.params.id)
    }
  },
  getInitialState: function () {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentWillMount: function () {
    var self = this
    ClusterActions.load().then(function () {
      self.setState({
        loaded: true
      })
    })
    this.listenTo(ClusterStore, this.onChange)
  },
  onChange: function () {
    this.setState(this.getState())
  },
  render: function () {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading</div>
    }

    return (
      <div className='ClusterShow'>
        <h1>Cluster</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Type</td>
              <td>{this.state.cluster.type}</td>
            </tr>
            <tr>
              <td>Machines</td>
              <td>{this.state.cluster.machines}</td>
            </tr>
            {this.state.cluster.type === 'swarm' &&
              <div>
                <tr>
                  <td>CA</td>
                  <td>{this.state.cluster.certificates.ca}</td>
                </tr>
                <tr>
                  <td>Certificate</td>
                  <td>{this.state.cluster.certificates.cert}</td>
                </tr>
                <tr>
                  <td>Key</td>
                  <td>{this.state.cluster.certificates.key}</td>
                </tr>
              </div>
            }
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = ClusterShow
