var React = require('react')
var Reflux = require('reflux')
var extend = require('lodash/object/extend')
var ClusterActions = require('../Clusters/actions')
var ClusterStore = require('../Clusters/store')
var Table = require('../Table')
var Button = require('../Button')
var Navigation = require('react-router').Navigation
var ClusterStatus = require('../ClusterStatus')

var ClusterShow = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
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
  onClickDelete: function() {
    var self = this
    ClusterActions.del(this.props.params.id).then(function () {
      self.transitionTo('/clusters')
    })
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
            <tr>
              <td>IP</td>
              <td>{this.state.cluster.ip}</td>
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
                <tr>
                  <td>Deleted</td>
                  <td>{this.state.cluster.deletedAt}</td>
                </tr>
              </div>
            }
          </tbody>
        </Table>
        <div>
          <Button variant='danger' onClick={this.onClickDelete}>Delete</Button>
        </div>
        <ClusterStatus cluster={this.props.params.id}/>
      </div>
    )
  }
})

module.exports = ClusterShow
