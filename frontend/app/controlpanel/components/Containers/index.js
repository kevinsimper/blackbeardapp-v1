var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var ContainerItem = require('../ContainerItem/')
var filter = require('lodash/collection/filter')

var store = require('./store')
var actions = require('./actions')

var Containers = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      containers: store.getOne(this.props.app)
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false,
      history: false
    })
  },
  componentDidMount: function() {
    var self = this
    actions.loadOne(this.props.app)
      .then(function() {
        self.setState({
          loaded: true
        })
        self.startAutoRefresh()
      })
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.stopAutoRefresh()
    this.unsubscribe()
  },
  startAutoRefresh: function () {
    var self = this
    this.refresh = window.setInterval(function() {
      actions.loadOne(self.props.app)
    }, 3000)
  },
  stopAutoRefresh: function() {
    window.clearInterval(this.refresh)
  },
  onChange: function() {
    this.setState(this.getState())
  },
  onClickShowHistory: function () {
    this.setState({
      history: !this.state.history
    })
  },
  render: function() {
    var self = this
    var runningContainers = filter(this.state.containers, {deleted: false}) || []
    return (
      <div>
        <h2>Containers</h2>
        <Table>
          <thead>
            <tr>
              <th>Status</th>
              <th>IP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runningContainers.map(function(container) {
              return <ContainerItem app={self.props.app} container={container} />
            })}
            {!runningContainers.length &&
              <tr>
                <td colSpan='3'>
                  No containers running
                </td>
              </tr>
            }
          </tbody>
        </Table>
        <div>
          <span style={{textAlign: 'right'}}>Estimated Monthly Cost: <span style={{marginLeft:10}}>${runningContainers.length * 7}</span></span>
        </div>
        <div style={{margin: '15px 0px'}}>
          <Button size='small' onClick={this.onClickShowHistory}>
            {(this.state.history) ? 'Hide history' : 'Show history'}
          </Button>
        </div>
        {this.state.history && <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Created</th>
              <th>Deleted</th>
            </tr>
          </thead>
          <tbody>
            {(filter(this.state.containers, {deleted: true}) || []).map(function(container) {
              return (
                <tr>
                  <td>{container._id}</td>
                  <td>{container.createdAt}</td>
                  <td>{container.deletedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>}
      </div>
    );
  }
})

module.exports = Containers
